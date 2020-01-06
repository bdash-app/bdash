import React from "react";
import Select, { SingleValueProps, OptionProps, ValueType, OptionTypeBase } from "react-select";
import { components } from "react-select";
import Chart from "../../../lib/Chart";
import { selectStyles } from "../Select";

type OptionType = {
  readonly label: string;
  readonly value: string;
};

export default class QueryResultChart extends React.Component<any, any> {
  chartElement: HTMLDivElement | null;

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

  handleChangeX(option: OptionType) {
    this.update({ xColumn: option ? option.value : null });
  }

  handleChangeY(options: ValueType<OptionTypeBase>) {
    this.update({ yColumns: options && Array.isArray(options) ? options.map(o => o.value) : [] });
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

    const chartOptionValue = (props: OptionProps<OptionType>) => {
      return (
        <components.Option {...props}>
          <i className={`fa fa-${props.data.value}-chart`} />
          {props.children}
        </components.Option>
      );
    };

    const chartSingleValue = (props: SingleValueProps<OptionType>) => {
      return (
        <components.SingleValue {...props}>
          <i className={`fa fa-${props.data.value}-chart`} />
          {props.children}
        </components.SingleValue>
      );
    };

    const options = ["line", "bar", "area", "pie"].map(value => {
      return { value, label: value[0].toUpperCase() + value.slice(1) };
    });
    const currentOption = options.find(option => option.value === chart.type);
    const fieldOptions = query.fields.map(name => ({
      value: name,
      label: name
    }));
    const currentXColumnFieldOption = fieldOptions.find(option => option.value === chart.xColumn);
    const currentYColumnFieldOptions = fieldOptions.filter(option => chart.yColumns.includes(option.value));
    const currentGroupOption = fieldOptions.find(option => option.value === chart.groupColumn);
    const stackingOptions = ["disable", "enable", "percent"].map(o => ({
      label: o,
      value: o
    }));
    const currentStackingOption = stackingOptions.find(option => option.value === chart.stacking);

    return (
      <div className="QueryResultChart">
        <div className="QueryResultChart-edit">
          <div className="QueryResultChart-item">
            <div className="QueryResultChart-label">Chart Type</div>
            <Select
              className="QueryResultChart-selectType"
              value={currentOption}
              options={options}
              components={{ Option: chartOptionValue, SingleValue: chartSingleValue }}
              optionRenderer={this.renderLabel}
              valueRenderer={this.renderLabel}
              onChange={o => this.handleSelectType(o)}
              isClearable={false}
              isSearchable={false}
              styles={selectStyles}
            />
          </div>
          <div className="QueryResultChart-item">
            <div className="QueryResultChart-label">{chart.type === "pie" ? "Label Column" : "X Column"}</div>
            <Select
              options={fieldOptions}
              value={currentXColumnFieldOption}
              onChange={o => this.handleChangeX(o)}
              isClearable={true}
              styles={selectStyles}
            />
          </div>
          <div className="QueryResultChart-item">
            <div className="QueryResultChart-label">{chart.type === "pie" ? "Value Column" : "Y Column"}</div>
            <Select
              isMulti={true}
              options={fieldOptions}
              value={currentYColumnFieldOptions}
              onChange={o => this.handleChangeY(o)}
              styles={selectStyles}
            />
          </div>
          <div className="QueryResultChart-item" hidden={chart.type !== "bar"}>
            <div className="QueryResultChart-label">Stacking</div>
            <Select
              value={currentStackingOption}
              onChange={o => this.handleSelectStacking(o)}
              options={stackingOptions}
              isClearable={false}
              styles={selectStyles}
            />
          </div>
          <div className="QueryResultChart-item" hidden={chart.type === "pie"}>
            <div className="QueryResultChart-label">Group By</div>
            <Select
              options={fieldOptions}
              value={currentGroupOption}
              onChange={o => this.handleChangeGroup(o)}
              styles={selectStyles}
            />
          </div>
        </div>
        <div className="QueryResultChart-chart">
          <div ref={node => (this.chartElement = node)} />
        </div>
      </div>
    );
  }
}
