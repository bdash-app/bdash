import React from "react";
import Select from "react-select";
import Chart from "../../../lib/Chart";

export default class QueryResultChart extends React.Component<any, any> {
  chartElement: HTMLDivElement; // eslint-disable-line no-undef

  shouldComponentUpdate(nextProps) {
    const query = nextProps.query;
    const chart = nextProps.chart;

    if (!query || !query.fields) return true;
    if (!this.props.chart || !chart) return true;

    if (this.props.query.id !== query.id) return true;
    if (this.props.query.runAt !== query.runAt) return true;
    if (this.props.chart.updatedAt !== chart.updatedAt) return true;

    return false;
  }

  drawChart() {
    const query = this.props.query;
    const chart = this.props.chart;
    if (!query || !chart || !this.chartElement) return;

    const params = {
      type: chart.type,
      x: chart.xColumn,
      y: chart.yColumns,
      stacking: chart.stacking,
      groupBy: chart.groupColumn,
      rows: query.rows,
      fields: query.fields
    };

    new Chart(params).drawTo(this.chartElement);
  }

  componentDidMount() {
    this.drawChart();
  }

  componentDidUpdate() {
    this.drawChart();
  }

  update(params) {
    this.props.onUpdateChart(this.props.chart.id, params);
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

  handleSelectStacking(option) {
    this.update({ stacking: option.value });
  }

  handleChangeGroup(option) {
    this.update({ groupColumn: option ? option.value : null });
  }

  renderLabel(option) {
    return (
      <span>
        <i className={`fa fa-${option.value}-chart`} />
        <span>{option.label}</span>
      </span>
    );
  }

  render() {
    const query = this.props.query;
    if (!query.fields) return null;

    const chart = this.props.chart;
    if (!chart) return null;

    const options: any[] = ["line", "bar", "area", "pie"].map(value => {
      return { value, label: value[0].toUpperCase() + value.slice(1) };
    });
    const fieldOptions = query.fields.map(name => ({
      value: name,
      label: name
    }));
    const stackingOptions: any[] = ["disable", "enable", "percent"].map(o => ({
      label: o,
      value: o
    }));

    return (
      <div className="QueryResultChart">
        <div className="QueryResultChart-edit">
          <div className="QueryResultChart-item">
            <div className="QueryResultChart-label">Chart Type</div>
            <Select
              className="QueryResultChart-selectType"
              value={chart.type}
              options={options}
              optionRenderer={this.renderLabel}
              valueRenderer={this.renderLabel}
              onChange={o => this.handleSelectType(o)}
              clearable={false}
            />
          </div>
          <div className="QueryResultChart-item">
            <div className="QueryResultChart-label">{chart.type === "pie" ? "Label Column" : "X Column"}</div>
            <Select options={fieldOptions} value={chart.xColumn} onChange={o => this.handleChangeX(o)} />
          </div>
          <div className="QueryResultChart-item">
            <div className="QueryResultChart-label">{chart.type === "pie" ? "Value Column" : "Y Column"}</div>
            <Select multi={true} options={fieldOptions} value={chart.yColumns} onChange={o => this.handleChangeY(o)} />
          </div>
          <div className="QueryResultChart-item" hidden={chart.type !== "bar"}>
            <div className="QueryResultChart-label">Stacking</div>
            <Select
              value={chart.stacking}
              onChange={o => this.handleSelectStacking(o)}
              options={stackingOptions}
              clearable={false}
            />
          </div>
          <div className="QueryResultChart-item" hidden={chart.type === "pie"}>
            <div className="QueryResultChart-label">Group By</div>
            <Select options={fieldOptions} value={chart.groupColumn} onChange={o => this.handleChangeGroup(o)} />
          </div>
        </div>
        <div className="QueryResultChart-chart">
          <div ref={node => (this.chartElement = node)} />
        </div>
      </div>
    );
  }
}
