import * as React from "react";

const MAX_DISPLAY_ROWS_COUNT = 1000;

export default class QueryResultTable extends React.Component<any, any> {
  shouldComponentUpdate(nextProps) {
    const query = nextProps.query;

    if (!query || !query.fields) return true;
    if (this.props.query.id !== query.id) return true;
    if (this.props.query.runAt !== query.runAt) return true;

    return false;
  }

  render() {
    const query = this.props.query;
    const heads = query.fields.map((field, i) => (
      <th key={`head-${i}`}>{field}</th>
    ));
    const rows = query.rows.slice(0, MAX_DISPLAY_ROWS_COUNT).map((row, i) => {
      const cols = row.map((value, j) => {
        const val = value === null ? "NULL" : value.toString();
        return (
          <td key={`${i}-${j}`} className={value === null ? "is-null" : ""}>
            {val}
          </td>
        );
      });
      return <tr key={`cols-${i}`}>{cols}</tr>;
    });

    return (
      <div className="QueryResultTable">
        <table className="QueryResultTable-table">
          <thead>
            <tr>{heads}</tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
        <div
          className="QueryResultTable-more"
          hidden={MAX_DISPLAY_ROWS_COUNT >= query.rows.length}
        >
          And more rows ...
        </div>
      </div>
    );
  }
}
