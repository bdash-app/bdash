import electron from 'electron';
import markdownTable from 'markdown-table';
import csvStringify from 'csv-stringify';
import GitHubApiClient from './GitHubApiClient';
import Chart from './Chart';

export default {
  shareOnGist({ query, chart, setting }) {
    return Promise.all([
      getTableDataAsTsv(query),
      getChartAsSvg(query, chart),
    ]).then(([tsv, svg]) => {
      let description = query.title;
      let files = {
        'query.sql': { content: query.body },
        'result.tsv': { content: tsv },
      };

      if (svg) {
        files['result2.svg'] = { content: svg };
      }

      return new GitHubApiClient(setting).postToGist({ description, files });
    }).then(result => {
      electron.shell.openExternal(result.html_url);
    });
  },

  copyAsMarkdown(query) {
    let markdown = markdownTable(getTableData(query));
    electron.clipboard.writeText(markdown);
  },

  copyAsTsv(query) {
    return getTableDataAsTsv(query).then(tsv => {
      electron.clipboard.writeText(tsv);
    });
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
