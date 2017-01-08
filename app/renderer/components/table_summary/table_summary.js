import React from 'react';

export default class TableSummary extends React.Component {
  render() {
    let dataSource = this.props.dataSource;
    if (!dataSource || !dataSource.tableSummary) return null;

    let heads = dataSource.tableSummary.fields.map((f, i) => <th key={i}>{f}</th>);
    let rows = dataSource.tableSummary.rows.map((row, i) => {
      let cols = row.map((v, j) => <td key={j}>{v}</td>);
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
