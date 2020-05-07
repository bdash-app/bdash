import React from "react";
import { QueryResultType } from "../../../lib/Database/Query";

const MAX_DISPLAY_ROWS_COUNT = 1000;

type Props = {
  readonly queryResult: QueryResultType;
};

export default class QueryResultTable extends React.Component<Props> {
  shouldComponentUpdate(nextProps: Props): boolean {
    const queryResult = nextProps.queryResult;

    if (!queryResult || !queryResult.fields) return true;
    if (this.props.queryResult.queryId !== queryResult.queryId) return true;
    if (this.props.queryResult.runAt !== queryResult.runAt) return true;

    return false;
  }

  render(): React.ReactNode {
    const queryResult = this.props.queryResult;
    const heads = queryResult.fields.map((field, i) => <th key={`head-${i}`}>{field}</th>);
    const rows = queryResult.rows.slice(0, MAX_DISPLAY_ROWS_COUNT).map((row, i) => {
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
        <div className="QueryResultTable-more" hidden={MAX_DISPLAY_ROWS_COUNT >= queryResult.rows.length}>
          And more rows ...
        </div>
      </div>
    );
  }
}
