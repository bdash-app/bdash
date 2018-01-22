import * as React from "react";

export default class TableSummary extends React.Component<any, any> {
  render() {
    const dataSource = this.props.dataSource;
    if (!dataSource || !dataSource.tableSummary) return null;

    const tableSummary = dataSource.tableSummary;
    const heads = tableSummary.defs.fields.map((f, i) => <th key={i}>{f}</th>);
    const rows = tableSummary.defs.rows.map((row, i) => {
      const cols = row.map((v, j) => <td key={j}>{v}</td>);
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
