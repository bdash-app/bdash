import React from "react";
import Select, { SingleValueProps, OptionProps, ValueType, OptionTypeBase } from "react-select";
import { components } from "react-select";
import Chart from "../../../lib/Chart";
import { selectStyles } from "../Select";
import { ChartType } from "../../../lib/Database/Chart";
import { QueryResultType } from "../../../lib/Database/Query";

type OptionType = {
  readonly label: string;
  readonly value: string;
};

type Props = {
  readonly queryResult: QueryResultType;
  readonly chart: ChartType | undefined;
  readonly onUpdateChart: (id: number, params: any) => void;
};

export default class QueryResultChart extends React.Component<Props> {
  chartElement: HTMLDivElement | null;

  shouldComponentUpdate(nextProps: Props): boolean {
    const queryResult = nextProps.queryResult;
    const chart = nextProps.chart;

    if (!queryResult || !queryResult.fields) return true;
    if (!this.props.chart || !chart) return true;

    if (this.props.queryResult.queryId !== queryResult.queryId) return true;
    if (this.props.queryResult.runAt !== queryResult.runAt) return true;
    if (this.props.chart.updatedAt !== chart.updatedAt) return true;

    return false;
  }

  async drawChart(): Promise<void> {
    const queryResult = this.props.queryResult;
    const chart = this.props.chart;
    if (!queryResult || !chart || !this.chartElement) return;

    const params = {
      type: chart.type,
      x: chart.xColumn,
      y: chart.yColumns,
      stacking: chart.stacking,
      groupBy: chart.groupColumn,
      rows: queryResult.rows,
      fields: queryResult.fields
    };

    await new Chart(params).drawTo(this.chartElement);
  }

  componentDidMount(): void {
    this.drawChart();
  }

  componentDidUpdate(): void {
    this.drawChart();
  }

  update(params: any): void {
    this.props.onUpdateChart(this.props.chart!.id, params);
  }

  handleSelectType(option: OptionType): void {
    this.update({ type: option.value });
  }

  handleChangeX(option: OptionType): void {
    this.update({ xColumn: option ? option.value : null });
  }

  handleChangeY(options: ValueType<OptionTypeBase>): void {
    this.update({ yColumns: options && Array.isArray(options) ? options.map(o => o.value) : [] });
  }

  handleSelectStacking(option: OptionType): void {
    this.update({ stacking: option.value });
  }

  handleChangeGroup(option: OptionType): void {
    this.update({ groupColumn: option ? option.value : null });
  }

  renderChartImage(chartType: string): React.ReactNode {
    if (chartType === "scatter") {
      return <img className="scatter" src="scatter.svg" />;
    } else {
      return <i className={`fas fa-chart-${chartType}`} />;
    }
  }

  renderLabel(option: OptionType): React.ReactNode {
    return (
      <span>
        {this.renderChartImage(option.value)}
        <span>{option.label}</span>
      </span>
    );
  }

  render(): React.ReactNode {
    const queryResult = this.props.queryResult;
    if (!queryResult.fields) return null;

    const chart = this.props.chart;
    if (!chart) return null;

    const chartOptionValue = (props: OptionProps<OptionType>): React.ReactElement => {
      return (
        <components.Option {...props}>
          {this.renderChartImage(props.data.value)}
          {props.children}
        </components.Option>
      );
    };

    const chartSingleValue = (props: SingleValueProps<OptionType>): React.ReactElement => {
      return (
        <components.SingleValue {...props}>
          {this.renderChartImage(props.data.value)}
          {props.children}
        </components.SingleValue>
      );
    };

    const options = ["line", "scatter", "bar", "area", "pie"].map(value => {
      return { value, label: value[0].toUpperCase() + value.slice(1) };
    });
    const currentOption = options.find(option => option.value === chart.type);
    const fieldOptions: { value: string; label: string }[] = queryResult.fields.map(name => ({
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
              onChange={(o): void => this.handleSelectType(o as OptionType)}
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
              onChange={(o): void => this.handleChangeX(o as OptionType)}
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
              onChange={(o): void => this.handleChangeY(o)}
              styles={selectStyles}
            />
          </div>
          <div className="QueryResultChart-item" hidden={chart.type !== "bar"}>
            <div className="QueryResultChart-label">Stacking</div>
            <Select
              value={currentStackingOption}
              onChange={(o): void => this.handleSelectStacking(o as OptionType)}
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
              onChange={(o): void => this.handleChangeGroup(o as OptionType)}
              isClearable={true}
              styles={selectStyles}
            />
          </div>
        </div>
        <div className="QueryResultChart-chart">
          <div ref={(node): HTMLElement | null => (this.chartElement = node)} />
        </div>
      </div>
    );
  }
}
