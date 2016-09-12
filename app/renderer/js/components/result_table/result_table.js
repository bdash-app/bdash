import React from 'react';
import Select from 'react-select';
import Chart from './chart';

export default class ResultTable extends React.Component {
  get chart() {
    return Object.assign({ selectedTab: 'table', type: 'line' }, this.props.query.chart);
  }

  update(nextState) {
    this.props.dispatch('updateChart', this.props.query, nextState);
  }

  selectTable() {
    this.update({ selectedTab: 'table' });
  }

  selectChart() {
    this.update({ selectedTab: 'chart' });
  }

  handleSelectType(option) {
    this.update({ type: option.value });
  }

  handleChangeX(option) {
    this.update({ x: option ? option.value : null });
  }

  handleChangeY(options) {
    this.update({ y: options.map(o => o.value) });
  }

  handleSelectStack(option) {
    this.update({ stack: option.value });
  }

  renderLabel(option) {
    return (
      <span>
        <i className={`fa fa-${option.value}-chart`}></i>
        <span>{option.label}</span>
      </span>
    );
  }

  selectedTable() {
    return this.chart.selectedTab === 'table';
  }

  selectedChart() {
    return this.chart.selectedTab === 'chart';
  }

  render() {
    if (!this.props.query.fields || !this.props.query.rows) return null;

    let heads = this.props.query.fields.map((field, i) => <th key={`head-${i}`}>{field.name}</th>);
    let rows = this.props.query.rows.map((row, i) => {
      let cols = Object.values(row).map((value, j) => <td key={`${i}-${j}`}>{`${value}`}</td>);
      return <tr key={`cols-${i}`}>{cols}</tr>;
    });
    let options = ['line', 'bar', 'area', 'pie'].map(value => {
      return { value, label: value[0].toUpperCase() + value.slice(1) };
    });
    let fieldOptions = this.props.query.fields.map(f => ({ value: f.name, label: f.name }));
    let stackOptions = ['disable', 'enable', 'percent'].map(o => ({ label: o, value: o }));

    return (
      <div className="QueryResult">
        <div className="QueryResult-tab">
          <span className={this.selectedTable() ? 'is-selected' : ''} onClick={() => this.selectTable()}><i className="fa fa-table"></i></span>
          <span className={this.selectedChart() ? 'is-selected' : ''} onClick={() => this.selectChart()}><i className="fa fa-bar-chart"></i></span>
        </div>

        <table className="ResultTable" hidden={!this.selectedTable()}>
          <thead><tr>{heads}</tr></thead>
          <tbody>{rows}</tbody>
        </table>

        <div className="ChartBody" hidden={!this.selectedChart()}>
          <div className="ChartEdit">
            <div className="ChartEdit-row">
              <div className="ChartEdit-label">Chart Type</div>
              <Select
                className="ChartSelect"
                value={this.chart.type}
                options={options}
                optionRenderer={this.renderLabel}
                valueRenderer={this.renderLabel}
                onChange={(o) => this.handleSelectType(o)}
                clearable={false}
                />
            </div>
            <div className="ChartEdit-row">
              <div className="ChartEdit-label">{this.chart.type === 'pie' ? 'Label Column' : 'X Column'}</div>
              <Select
                options={fieldOptions}
                value={this.chart.x}
                onChange={(o) => this.handleChangeX(o)}
                />
            </div>
            <div className="ChartEdit-row">
              <div className="ChartEdit-label">{this.chart.type === 'pie' ? 'Value Column' : 'Y Column'}</div>
              <Select
                multi={true}
                options={fieldOptions}
                value={this.chart.y}
                onChange={(o) => this.handleChangeY(o)}
                />
            </div>
            <div className="ChartEdit-row" hidden={this.chart.type !== 'bar'}>
              <div className="ChartEdit-label">Stacking</div>
              <Select
                value={this.chart.stack}
                onChange={o => this.handleSelectStack(o)}
                options={stackOptions}
                clearable={false}
                />
            </div>
          </div>
          <div className="ChartPreview">
            <Chart type={this.chart.type} x={this.chart.x} y={this.chart.y} stack={this.chart.stack} rows={this.props.query.rows} />
          </div>
        </div>
      </div>
    );
  }
}
