import React from 'react';
import ReactDOM from 'react-dom';
import Plotly from 'plotly.js/dist/plotly.js';
import yaml from 'yamljs';

export default class ResultTable extends React.Component {
  componentDidMount() {
    this.renderChart();
  }

  componentDidUpdate() {
    this.renderChart();
  }

  render() {
    if (!this.props.query.fields || !this.props.query.rows) return null;

    let heads = this.props.query.fields.map((field, i) => <th key={`head-${i}`}>{field.name}</th>);
    let rows = this.props.query.rows.map((row, i) => {
      let cols = Object.values(row).map((value, j) => <td key={`${i}-${j}`}>{`${value}`}</td>);
      return <tr key={`cols-${i}`}>{cols}</tr>;
    });

    return (
      <div className="QueryResult">
        <table className="ResultTable">
          <thead><tr>{heads}</tr></thead>
          <tbody>{rows}</tbody>
        </table>
        <div ref="chart" />
      </div>
    );
  }

  renderChart() {
    let m = this.props.query.sql.match(/\/\*([\s\S]*?)\*\//m);
    if (!m) return null;

    let chart = ReactDOM.findDOMNode(this.refs.chart);
    let chartDef = yaml.parse(m[1]);
    let params = {
      type: chartDef.type,
      x: this.dataByField(chartDef.x),
      y: this.dataByField(chartDef.y),
    };
    Plotly.newPlot(chart, [params], {}, { displayModeBar: false });
  }

  dataByField(fieldName) {
    return this.props.query.rows.map(r => r[fieldName]);
  }
}
