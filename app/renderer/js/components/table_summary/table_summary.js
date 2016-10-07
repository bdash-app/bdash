import React from 'react';

export default class TableSummary extends React.Component {
  render() {
    let dataSource = this.props.dataSource;
    if (!dataSource || !dataSource.tableSummary) return null;

    let fields = dataSource.tableSummary.fields.map(f => f.name);
    let heads = fields.map((f, i) => <th key={i}>{f}</th>);
    let rows = dataSource.tableSummary.rows.map((row, i) => {
      let cols = Object.keys(row).map(k => <td key={`${k}-{i}`}>{row[k]}</td>);
      return <tr key={i}>{cols}</tr>;
    });

    return <div className="TableSummary">
      <table>
        <thead><tr>{heads}</tr></thead>
        <tbody>{rows}</tbody>
      </table>
    </div>;
  }
}
