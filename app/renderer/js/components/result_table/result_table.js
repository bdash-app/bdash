import React from 'react';
import Chart from './chart';

export default class ResultTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: 'chart',
      type: 'line',
      x: 'day',
      y: ['value', 'value2'],
      stack: 'disable',
    };
  }

  selectTable() {
    this.setState({ show: 'table' });
  }

  selectChart() {
    this.setState({ show: 'chart' });
  }

  handleSelectType(e) {
    this.setState({ type: e.target.value });
  }

  handleChangeX(e) {
    this.setState({ x: e.target.value });
  }

  handleChangeY(e) {
    this.setState({ y: e.target.value.split(',') });
  }

  handleSelectStack(e) {
    this.setState({ stack: e.target.value });
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
        <div className="QueryResult-tab">
          <span onClick={() => this.selectTable()}><i className="fa fa-table"></i></span>
          <span onClick={() => this.selectChart()}><i className="fa fa-bar-chart"></i></span>
        </div>
        <table className="ResultTable" hidden={this.state.show !== 'table'}>
          <thead><tr>{heads}</tr></thead>
          <tbody>{rows}</tbody>
        </table>

        <div hidden={this.state.show !== 'chart'}>
          <select value={this.state.type} onChange={e => this.handleSelectType(e)}>
            <option value="">--</option>
            <option value="line">Line</option>
            <option value="bar">Bar</option>
            <option value="area">Area</option>
            <option value="pie">Pie</option>
          </select>
          <div>x: <input value={this.state.x} onChange={e => this.handleChangeX(e)} /></div>
          <div>y: <input value={this.state.y} onChange={e => this.handleChangeY(e)} /></div>
          <select value={this.state.stack} onChange={e => this.handleSelectStack(e)}>
            <option value="disable">disable</option>
            <option value="enable">enable</option>
            <option value="percent">percent</option>
          </select>
          <Chart type={this.state.type} x={this.state.x} y={this.state.y} stack={this.state.stack} rows={this.props.query.rows} />
        </div>
      </div>
    );
  }
}
