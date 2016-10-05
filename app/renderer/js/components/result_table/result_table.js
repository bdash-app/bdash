import React from 'react';
import Select from 'react-select';
import Chart from './chart';

const MAX_DISPLAY_ROWS_COUNT = 1000;

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

  renderError() {
    return (
      <div className="QueryResult">
        <div className="QueryResult-errorMessage">{this.props.query.error}</div>
      </div>
    );
  }

  render() {
    let query = this.props.query;
    if (query.status === 'fail') {
      return this.renderError();
    }

    if (!query.fields || !query.rows) return null;

    let heads = query.fields.map((field, i) => <th key={`head-${i}`}>{field.name}</th>);
    let rows = query.rows.slice(0, MAX_DISPLAY_ROWS_COUNT).map((row, i) => {
      let cols = Object.values(row).map((value, j) => {
        let val = value === null ? 'NULL' : value.toString();
        return <td key={`${i}-${j}`} className={value === null ? 'is-null' : ''}>{val}</td>;
      });
      return <tr key={`cols-${i}`}>{cols}</tr>;
    });
    let options = ['line', 'bar', 'area', 'pie'].map(value => {
      return { value, label: value[0].toUpperCase() + value.slice(1) };
    });
    let fieldOptions = query.fields.map(f => ({ value: f.name, label: f.name }));
    let stackOptions = ['disable', 'enable', 'percent'].map(o => ({ label: o, value: o }));

    return (
      <div className="QueryResult">
        <div className="QueryResult-tab">
          <span className={this.selectedTable() ? 'is-selected' : ''} onClick={() => this.selectTable()}><i className="fa fa-table"></i></span>
          <span className={this.selectedChart() ? 'is-selected' : ''} onClick={() => this.selectChart()}><i className="fa fa-bar-chart"></i></span>
        </div>

        <div className="ResultTable" hidden={!this.selectedTable()}>
          <table className="ResultTable-table">
            <thead><tr>{heads}</tr></thead>
            <tbody>{rows}</tbody>
          </table>
          <div className="ResultTable-more" hidden={MAX_DISPLAY_ROWS_COUNT >= query.rows.length}>And more rows ...</div>
        </div>

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
            <Chart type={this.chart.type} x={this.chart.x} y={this.chart.y} stack={this.chart.stack} rows={query.rows} />
          </div>
        </div>
      </div>
    );
  }
}
