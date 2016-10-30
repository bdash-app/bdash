import React from 'react';
import Select from 'react-select';
import Chart from './chart';

export default class QueryResultChart extends React.Component {
  shouldComponentUpdate(nextProps) {
    let query = nextProps.query;
    let chart = nextProps.chart;

    if (!query || !query.fields) return true;
    if (!chart) return true;

    if (this.props.query.id !== query.id) return true;
    if (this.props.query.selectedTab !== query.selectedTab && query.selectedTab === 'chart') return true;
    if (this.props.query.runAt !== query.runAt) return true;
    if (this.props.chart.updatedAt !== chart.updatedAt) return true;

    return false;
  }

  update(nextState) {
    this.props.dispatch('updateChart', this.props.chart.id, nextState);
  }

  handleSelectType(option) {
    this.update({ type: option.value });
  }

  handleChangeX(option) {
    this.update({ xColumn: option ? option.value : null });
  }

  handleChangeY(options) {
    this.update({ yColumns: options.map(o => o.value) });
  }

  handleSelectStack(option) {
    this.update({ stack: option.value });
  }

  renderLabel(option) {
    return <span>
      <i className={`fa fa-${option.value}-chart`}></i>
      <span>{option.label}</span>
    </span>;
  }

  render() {
    let query = this.props.query;
    if (!query.fields) return null;

    let chart = this.props.chart;
    if (!chart) return null;

    let options = ['line', 'bar', 'area', 'pie'].map(value => {
      return { value, label: value[0].toUpperCase() + value.slice(1) };
    });
    let fieldOptions = query.fields.map(f => ({ value: f.name, label: f.name }));
    let stackOptions = ['disable', 'enable', 'percent'].map(o => ({ label: o, value: o }));

    return <div className="ChartBody" hidden={query.selectedTab !== 'chart'}>
      <div className="ChartEdit">
        <div className="ChartEdit-row">
          <div className="ChartEdit-label">Chart Type</div>
          <Select
            className="ChartSelect"
            value={chart.type}
            options={options}
            optionRenderer={this.renderLabel}
            valueRenderer={this.renderLabel}
            onChange={(o) => this.handleSelectType(o)}
            clearable={false}
            />
        </div>
        <div className="ChartEdit-row">
          <div className="ChartEdit-label">{chart.type === 'pie' ? 'Label Column' : 'X Column'}</div>
          <Select
            options={fieldOptions}
            value={chart.xColumn}
            onChange={(o) => this.handleChangeX(o)}
            />
        </div>
        <div className="ChartEdit-row">
          <div className="ChartEdit-label">{chart.type === 'pie' ? 'Value Column' : 'Y Column'}</div>
          <Select
            multi={true}
            options={fieldOptions}
            value={chart.yColumns}
            onChange={(o) => this.handleChangeY(o)}
            />
        </div>
        <div className="ChartEdit-row" hidden={chart.type !== 'bar'}>
          <div className="ChartEdit-label">Stacking</div>
          <Select
            value={chart.stack}
            onChange={o => this.handleSelectStack(o)}
            options={stackOptions}
            clearable={false}
            />
        </div>
      </div>
      <div className="ChartPreview">
        <Chart type={chart.type} x={chart.xColumn} y={chart.yColumns} stack={chart.stack} rows={query.rows} />
      </div>
    </div>;
  }
}
