import React from 'react';

export default class TableSummary extends React.Component {
  render() {
    let connection = this.props.connection;
    if (!connection || !connection.tableSummary) return null;

    let fields = connection.tableSummary.fields.map(f => f.name);
    let heads = fields.map((f, i) => <th key={i}>{f}</th>);
    let rows = connection.tableSummary.rows.map((row, i) => {
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
