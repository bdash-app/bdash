import electron from "electron";
import markdownTable from "markdown-table";
import csvStringify from "csv-stringify";
import GitHubApiClient from "./GitHubApiClient";
import Chart from "./Chart";
import DataSource from "./DataSource";
import Util from "./Util";
import { BdashServerSettingType, GithubSettingType } from "./Setting";
import { ChartType } from "./Database/Chart";
import { QueryType } from "./Database/Query";
import { DataSourceType } from "src/renderer/pages/DataSource/DataSourceStore";
import BdashServerClient from "./BdashServerClient";

export default {
  async shareOnGist({
    query,
    chart,
    setting,
    dataSource
  }: {
    query: QueryType;
    chart: ChartType | undefined;
    setting: GithubSettingType;
    dataSource: DataSourceType;
  }): Promise<void> {
    const chartWidth = 1000;
    const [tsv, svg] = await Promise.all([
      getTableDataAsTsv(query, setting.maximumNumberOfRowsOfGist),
      getChartAsSvg(query, chart, chartWidth)
    ]);

    const description = query.title;

    const infoMd = Util.stripHeredoc(`
      ## Data source
      |key|value|
      |---|---|
      ${DataSource.create(dataSource).infoMdTable()}

      ## Created by
      [Bdash](https://github.com/bdash-app/bdash)
    `);

    // https://github.com/bdash-app/bdash/issues/40
    const fileNamePrefix = query.title !== "" ? query.title.replace(/[/\s]/g, "_") : "bdash";
    const files = {
      [`${fileNamePrefix}.sql`]: { content: query.body },
      [`${fileNamePrefix}_02.tsv`]: { content: tsv },
      [`${fileNamePrefix}_03.md`]: { content: infoMd }
    };

    if (svg) {
      files[`${fileNamePrefix}_01.svg`] = { content: svg };
    }

    const client = new GitHubApiClient(setting);
    const result = await client.postToGist({ description, files, public: setting.public });

    await electron.shell.openExternal(result.html_url);
  },

  copyAsMarkdown(query: QueryType, maximumNumberOfRowsOfGist?: number): void {
    const markdown = markdownTable(getTableData(query, maximumNumberOfRowsOfGist));
    electron.clipboard.writeText(markdown);
  },

  async copyAsTsv(query: QueryType, maximumNumberOfRowsOfGist?: number): Promise<void> {
    const tsv = await getTableDataAsTsv(query, maximumNumberOfRowsOfGist);
    return electron.clipboard.writeText(tsv);
  },

  async copyAsCsv(query: QueryType): Promise<void> {
    const csv = await getTableDataAsCsv(query);
    return electron.clipboard.writeText(csv);
  },

  async shareOnBdashServer({
    query,
    chart,
    setting,
    dataSource
  }: {
    query: QueryType;
    chart: ChartType | undefined;
    setting: BdashServerSettingType;
    dataSource: DataSourceType;
  }): Promise<void> {
    const chartWidth = 1200;
    const [tsv, svg] = await Promise.all([
      getTableDataAsTsv(query, setting.maximumNumberOfRows),
      getChartAsSvg(query, chart, chartWidth)
    ]);

    const description = query.title;
    const ds = DataSource.create(dataSource);
    const dataSourceInfo = ds.dataSourceInfo();

    const files = {
      "query.sql": { content: query.body },
      "result.tsv": { content: tsv },
      "data_source.json": { content: JSON.stringify(dataSourceInfo) }
    };

    if (svg) {
      files["chart.svg"] = { content: svg };
    }

    const client = new BdashServerClient(setting);
    const result = await client.post({ description, files });

    await electron.shell.openExternal(result.html_url);
  }
};

// private functions
function getTableData(query: QueryType, maximumNumberOfRowsOfGist?: number): any[] {
  const rows = maximumNumberOfRowsOfGist ? query.rows.slice(0, maximumNumberOfRowsOfGist) : query.rows;
  return [query.fields].concat(rows.map(row => Object.values(row)));
}

function getTableDataAsTsv(query: QueryType, maximumNumberOfRowsOfGist?: number): Promise<string> {
  return new Promise((resolve, reject) => {
    csvStringify(getTableData(query, maximumNumberOfRowsOfGist), { delimiter: "\t" }, (err, tsv) => {
      if (err) {
        reject(err);
      } else {
        resolve(tsv);
      }
    });
  });
}

function getTableDataAsCsv(query: QueryType): Promise<string> {
  return new Promise((resolve, reject) => {
    const csvOpts = {
      eof: true,
      quote: '"',
      quoted: true,
      quotedEmpty: true,
      quotedString: true,
      escape: '"',
      columns: query.fields,
      header: true
    };
    const data = query.rows.map(row => Object.values(row));
    // @ts-ignore
    csvStringify(data, csvOpts, (err: Error, csv: string) => {
      if (err) {
        reject(err);
      } else {
        resolve(csv);
      }
    });
  });
}

function getChartAsSvg(query: QueryType, chart: ChartType | undefined, width: number): Promise<string | null> {
  if (!query || !chart) return Promise.resolve(null);

  const params = {
    type: chart.type,
    x: chart.xColumn,
    y: chart.yColumns,
    stacking: chart.stacking,
    groupBy: chart.groupColumns,
    rows: query.rows,
    fields: query.fields
  };

  return new Chart(params).toSVG({ width });
}
