import * as React from 'react';

export default class TableSummary extends React.Component<any, any> {
  render() {
    let dataSource = this.props.dataSource;
    if (!dataSource || !dataSource.tableSummary) return null;

    let tableSummary = dataSource.tableSummary;
    let heads = tableSummary.defs.fields.map((f, i) => <th key={i}>{f}</th>);
    let rows = tableSummary.defs.rows.map((row, i) => {
      let cols = row.map((v, j) => <td key={j}>{v}</td>);
      return <tr key={i}>{cols}</tr>;
    });

    let schema = tableSummary.schema ? `${tableSummary.schema}.` : '';
    let tableName = schema + tableSummary.name;

    return <div className="TableSummary">
      <h1 className="TableSummary-name">{tableName}</h1>
      <table>
        <thead><tr>{heads}</tr></thead>
        <tbody>{rows}</tbody>
      </table>
    </div>;
  }
}
