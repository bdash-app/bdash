import React from "react";
import { QueryType } from "../../../lib/Database/Query";
import Linkify from "react-linkify";
import DataTable from "react-data-table-component";

const MAX_DISPLAY_ROWS_COUNT = 1000;

type Props = {
  readonly query: QueryType;
};

export default class QueryResultTable extends React.Component<Props> {
  override shouldComponentUpdate(nextProps: Props): boolean {
    const query = nextProps.query;

    if (!query || !query.fields) return true;
    if (this.props.query.id !== query.id) return true;
    if (this.props.query.runAt !== query.runAt) return true;

    return false;
  }

  renderValue(value: any): React.ReactNode {
    if (value === null) {
      return <span className="QueryResultTable-null">NULL</span>;
    }

    if (Array.isArray(value)) {
      return (
        <ul className="QueryResultTable-list">
          {value.map((v, i) => (
            <li key={i}>{this.renderValue(v)}</li>
          ))}
        </ul>
      );
    }

    if (typeof value === "object") {
      return (
        <ul className="QueryResultTable-list">
          {Object.keys(value).map((key) => (
            <li key={key}>
              <span className="QueryResultTable-listKey">{key}:</span>
              {this.renderValue(value[key])}
            </li>
          ))}
        </ul>
      );
    }

    if (typeof value === "string") {
      return <Linkify>{value}</Linkify>;
    }

    return value.toString();
  }

  override render(): React.ReactNode {
    const query = this.props.query;
    const heads = query.fields.map((field, i) => <th key={`head-${i}`}>{field}</th>);
    const rows = query.rows.slice(0, MAX_DISPLAY_ROWS_COUNT).map((row, i) => {
      const cols = row.map((value, j) => <td key={`${i}-${j}`}>{this.renderValue(value)}</td>);
      return <tr key={`cols-${i}`}>{cols}</tr>;
    });

   // Convert column result to datatable
   const columns: object[] = [];
   query.fields.forEach((el) => {
     const item = {
       name: el,
       selector: (row) => row[el],
       sortable: true,
     };
     columns.push(item);
   });

   // Convert column result to datatable
   const data: object[] = [];
   query.rows.forEach((el) => {
     const item = {};
     query.fields.forEach((key, idx) => (item[key] = el[idx]));
     data.push(item);
   });

   return (
     <div className="QueryResultTable">
       <DataTable title="Search Results" columns={columns} data={data} pagination />
      </div>
    );
  }
}
