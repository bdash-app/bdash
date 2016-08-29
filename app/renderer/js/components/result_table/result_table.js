import React from 'react';

export default class ResultTable extends React.Component {
  render() {
    if (!this.props.query.fields || !this.props.query.rows) return null;

    let heads = this.props.query.fields.map((field, i) => <th key={`head-${i}`}>{field.name}</th>);
    let rows = this.props.query.rows.map((row, i) => {
      let cols = Object.values(row).map((value, j) => <td key={`${i}-${j}`}>{`${value}`}</td>);
      return <tr key={`cols-${i}`}>{cols}</tr>;
    });

    return (
      <table className="ResultTable">
        <thead><tr>{heads}</tr></thead>
        <tbody>{rows}</tbody>
      </table>
    );
  }
}
