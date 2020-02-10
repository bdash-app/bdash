import React from "react";
import { DataSourceType } from "../../pages/DataSource/DataSourceStore";

type Props = {
  readonly dataSource?: DataSourceType;
};

export default class TableSummary extends React.Component<Props> {
  render() {
    const dataSource = this.props.dataSource;
    if (!dataSource || !dataSource.tableSummary) return null;

    const tableSummary = dataSource.tableSummary;
    const heads = tableSummary.defs.fields.map((f, i: number) => <th key={i}>{f}</th>);
    const rows = tableSummary.defs.rows.map((row, i: number) => {
      const cols = row.map((v, j: number) => <td key={j}>{v}</td>);
      return <tr key={i}>{cols}</tr>;
    });

    const schema = tableSummary.schema ? `${tableSummary.schema}.` : "";
    const tableName = schema + tableSummary.name;

    return (
      <div className="TableSummary">
        <h1 className="TableSummary-name">{tableName}</h1>
        <table>
          <thead>
            <tr>{heads}</tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
    );
  }
}
