import React from "react";
import { QueryType } from "../../../lib/Database/Query";

const MAX_DISPLAY_ROWS_COUNT = 1000;
const URL_PATTERN = /https?:\/\/\S+/;

type Props = {
  readonly query: QueryType;
};

export default class QueryResultTable extends React.Component<Props> {
  shouldComponentUpdate(nextProps: Props): boolean {
    const query = nextProps.query;

    if (!query || !query.fields) return true;
    if (this.props.query.id !== query.id) return true;
    if (this.props.query.runAt !== query.runAt) return true;

    return false;
  }

  renderValue(val: string): React.ReactNode {
    const result: React.ReactNodeArray = [];
    let acc = val;
    for (let i = 0; ; i++) {
      const match = acc.match(URL_PATTERN);
      if (match) {
        result.push(acc.substring(0, match.index!));
        result.push(
          <a key={i} href={match[0]}>
            {match[0]}
          </a>
        );
        acc = acc.substring(match.index! + match[0].length, acc.length);
      } else {
        break;
      }
    }
    if (acc.length > 0) {
      result.push(acc);
    }
    return result;
  }

  render(): React.ReactNode {
    const query = this.props.query;
    const heads = query.fields.map((field, i) => <th key={`head-${i}`}>{field}</th>);
    const rows = query.rows.slice(0, MAX_DISPLAY_ROWS_COUNT).map((row, i) => {
      const cols = row.map((value, j) => {
        const val = value === null ? "NULL" : value.toString();
        return (
          <td key={`${i}-${j}`} className={value === null ? "is-null" : ""}>
            {this.renderValue(val)}
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
        <div className="QueryResultTable-more" hidden={MAX_DISPLAY_ROWS_COUNT >= query.rows.length}>
          And more rows ...
        </div>
      </div>
    );
  }
}
