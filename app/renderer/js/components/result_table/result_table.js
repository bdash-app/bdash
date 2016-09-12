import React from 'react';
import Select from 'react-select';
import Chart from './chart';

class Option extends React.Component {
  render() {
    console.log(this.props);
    return <div>foo</div>;
  }
}

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

  handleSelectType(option) {
    this.setState({ type: option.value });
  }

  handleChangeX(option) {
    this.setState({ x: option ? option.value : null });
  }

  handleChangeY(options) {
    this.setState({ y: options.map(o => o.value) });
  }

  handleSelectStack(option) {
    this.setState({ stack: option.value });
  }

  renderLabel(option) {
    return (
      <span>
        <i className={`fa fa-${option.value}-chart`}></i>
        <span>{option.label}</span>
      </span>
    );
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
    let xPlaceholder = this.state.type === 'pie' ? 'Label Column' : 'X Column';
    let yPlaceholder = this.state.type === 'pie' ? 'Value Column' : 'Y Columns';

    return (
      <div className="QueryResult">
        <div className="QueryResult-tab">
          <span className={this.state.show === 'table' ? 'is-selected' : ''} onClick={() => this.selectTable()}><i className="fa fa-table"></i></span>
          <span className={this.state.show === 'chart' ? 'is-selected' : ''} onClick={() => this.selectChart()}><i className="fa fa-bar-chart"></i></span>
        </div>

        <table className="ResultTable" hidden={this.state.show !== 'table'}>
          <thead><tr>{heads}</tr></thead>
          <tbody>{rows}</tbody>
        </table>

        <div className="ChartBody" hidden={this.state.show !== 'chart'}>
          <div className="ChartEdit">
            <div className="ChartEdit-row">
              <div className="ChartEdit-label">Chart Type</div>
              <Select
                className="ChartSelect"
                value={this.state.type}
                options={options}
                optionRenderer={this.renderLabel}
                valueRenderer={this.renderLabel}
                onChange={(o) => this.handleSelectType(o)}
                clearable={false}
                />
            </div>
            <div className="ChartEdit-row">
              <div className="ChartEdit-label">{this.state.type === 'pie' ? 'Label Column' : 'X Column'}</div>
              <Select
                options={fieldOptions}
                value={this.state.x}
                onChange={(o) => this.handleChangeX(o)}
                />
            </div>
            <div className="ChartEdit-row">
              <div className="ChartEdit-label">{this.state.type === 'pie' ? 'Value Column' : 'Y Column'}</div>
              <Select
                multi={true}
                options={fieldOptions}
                value={this.state.y}
                onChange={(o) => this.handleChangeY(o)}
                />
            </div>
            <div className="ChartEdit-row" hidden={this.state.type !== 'bar'}>
              <div className="ChartEdit-label">Stacking</div>
              <Select
                value={this.state.stack}
                onChange={o => this.handleSelectStack(o)}
                options={stackOptions}
                clearable={false}
                />
            </div>
          </div>
          <div className="ChartPreview">
            <Chart type={this.state.type} x={this.state.x} y={this.state.y} stack={this.state.stack} rows={this.props.query.rows} />
          </div>
        </div>
      </div>
    );
  }
}
