import electron from "electron";
import markdownTable from "markdown-table";
import csvStringify from "csv-stringify";
import GitHubApiClient from "./GitHubApiClient";
import Chart from "./Chart";
import DataSource from "./DataSource";
import Util from "./Util";
import { GithubSettingType } from "./Setting";
import { ChartType } from "./Database/Chart";
import { QueryType } from "./Database/Query";

export default {
  async shareOnGist({
    query,
    chart,
    setting,
    dataSource
  }: {
    query: QueryType;
    chart: ChartType;
    setting: GithubSettingType;
    dataSource: any;
  }) {
    const [tsv, svg] = await Promise.all([getTableDataAsTsv(query), getChartAsSvg(query, chart)]);

    const description = query.title;
    const infoMd = Util.stripHeredoc(`
      ## Data source
      |key|value|
      |---|---|
      |type|${dataSource.type}
      ${DataSource.create(dataSource).descriptionTable()}

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
    const result = await client.postToGist({ description, files });

    electron.shell.openExternal(result.html_url);
  },

  copyAsMarkdown(query) {
    const markdown = markdownTable(getTableData(query));
    electron.clipboard.writeText(markdown);
  },

  async copyAsTsv(query) {
    const tsv = await getTableDataAsTsv(query);
    return electron.clipboard.writeText(tsv);
  },

  async copyAsCsv(query) {
    const csv = await getTableDataAsCsv(query);
    return electron.clipboard.writeText(csv);
  }
};

// private functions
function getTableData(query) {
  const rows = query.rows.map(row => Object.values(row));
  return [query.fields].concat(rows);
}

function getTableDataAsTsv(query): Promise<string> {
  return new Promise((resolve, reject) => {
    csvStringify(getTableData(query), { delimiter: "\t" }, (err, tsv) => {
      if (err) {
        reject(err);
      } else {
        resolve(tsv);
      }
    });
  });
}

function getTableDataAsCsv(query): Promise<string> {
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
    csvStringify(data, csvOpts, (err, csv) => {
      if (err) {
        reject(err);
      } else {
        resolve(csv);
      }
    });
  });
}

function getChartAsSvg(query, chart: ChartType) {
  if (!query || !chart) return Promise.resolve(null);

  const params = {
    type: chart.type,
    x: chart.xColumn,
    y: chart.yColumns,
    stacking: chart.stacking,
    groupBy: chart.groupColumn,
    rows: query.rows,
    fields: query.fields
  };

  return new Chart(params).toSVG();
}
