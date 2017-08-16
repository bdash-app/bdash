import electron from 'electron';
import markdownTable from 'markdown-table';
import csvStringify from 'csv-stringify';
import GitHubApiClient from './GitHubApiClient';
import Chart from './Chart';
import DataSource from './DataSource';

export default {
  async shareOnGist({ query, chart, setting, dataSource }) {
    let [tsv, svg] = await Promise.all([
      getTableDataAsTsv(query),
      getChartAsSvg(query, chart),
    ]);

    let description = query.title;
    let files = {
      'query.sql': { content: `/*\ndataSource: ${dataSource.type}\n${DataSource.create(dataSource).description()}\n*/\n\n${query.body}` },
      'result.tsv': { content: tsv },
    };

    if (svg) {
      files['result2.svg'] = { content: svg };
    }

    let client = new GitHubApiClient(setting);
    let result = await client.postToGist({ description, files });

    electron.shell.openExternal(result.html_url);
  },

  copyAsMarkdown(query) {
    let markdown = markdownTable(getTableData(query));
    electron.clipboard.writeText(markdown);
  },

  async copyAsTsv(query) {
    let tsv = await getTableDataAsTsv(query);
    return electron.clipboard.writeText(tsv);
  },

  async copyAsCsv(query) {
    let csv = await getTableDataAsCsv(query);
    return electron.clipboard.writeText(csv);
  },
};

// private functions
function getTableData(query) {
  let rows = query.rows.map(row => Object.values(row));
  return [query.fields].concat(rows);
}

function getTableDataAsTsv(query) {
  return new Promise((resolve, reject) => {
    csvStringify(getTableData(query), { delimiter: '\t' }, (err, tsv) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(tsv);
      }
    });
  });
}

function getTableDataAsCsv(query) {
  return new Promise((resolve, reject) => {
    const csvOpts = {
      'eof': true,
      'quote': '"',
      'quoted': true,
      'quotedEmpty': true,
      'quotedString': true,
      'escape': '"',
      'columns': query.fields,
      'header': true
    };
    const data = query.rows.map(row => Object.values(row));
    csvStringify(data, csvOpts, (err, csv) => {
      if (err) {
        reject(err)
      }
      else {
        resolve(csv);
      }
    });
  });
}

function getChartAsSvg(query, chart) {
  if (!query || !chart) return Promise.resolve(null);

  let params = {
    type: chart.type,
    x: chart.xColumn,
    y: chart.yColumns,
    stacking: chart.stacking,
    groupBy: chart.groupColumn,
    rows: query.rows,
    fields: query.fields,
  };

  return new Chart(params).toSVG();
}
