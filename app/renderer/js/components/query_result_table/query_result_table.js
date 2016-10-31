import React from 'react';

const MAX_DISPLAY_ROWS_COUNT = 1000;

export default class QueryResultTable extends React.Component {
  render() {
    let query = this.props.query;
    if (query.status === 'failure') {
      return this.renderError();
    }

    if (!query.fields || !query.rows) return null;
    if (query.selectedTab !== 'table') return null;

    let heads = query.fields.map((field, i) => <th key={`head-${i}`}>{field.name}</th>);
    let rows = query.rows.slice(0, MAX_DISPLAY_ROWS_COUNT).map((row, i) => {
      let cols = Object.values(row).map((value, j) => {
        let val = value === null ? 'NULL' : value.toString();
        return <td key={`${i}-${j}`} className={value === null ? 'is-null' : ''}>{val}</td>;
      });
      return <tr key={`cols-${i}`}>{cols}</tr>;
    });

    return <div className="ResultTable">
      <table className="ResultTable-table">
        <thead><tr>{heads}</tr></thead>
        <tbody>{rows}</tbody>
      </table>
      <div className="ResultTable-more" hidden={MAX_DISPLAY_ROWS_COUNT >= query.rows.length}>And more rows ...</div>
    </div>;
  }
}
