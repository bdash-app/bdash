import React from 'react';
import ReactDOM from 'react-dom';
import Plotly from 'plotly.js/dist/plotly.js';
import _ from 'lodash';

export default class Chart extends React.Component {
  draw() {
    let chart = ReactDOM.findDOMNode(this);
    let params = this[this.props.type]();
    let layout = { showlegend: true, margin: { l: 50, r: 50, t: 10, b: 120, pad: 4 } };
    if (this.props.stacking === 'enable') {
      layout.barmode = 'stack';
    }
    if (this.props.stacking === 'percent') {
      layout.barmode = 'stack';
      layout.barnorm = 'percent';
    }
    Plotly.newPlot(chart, params, layout, { displayModeBar: false });
  }

  // TODO: Performance tuning
  generateChartData() {
    if (!this.props.y) return [];

    if (!this.props.groupBy) {
      return this.props.y.map(y => {
        return {
          x: this.dataByField(this.props.x),
          y: this.dataByField(y),
          name: y,
        };
      });
    }

    let groupValues = _.uniq(this.dataByField(this.props.groupBy));
    let x = _.groupBy(this.props.rows, row => row[this.props.groupBy]);

    return _.flatMap(this.props.y, y => {
      return groupValues.map(g => ({
        name: `${y} (${g})`,
        x: x[g].map(row => row[this.props.x]),
        y: this.props.rows
          .filter(row => row[this.props.groupBy] === g)
          .map(row => row[y]),
      }));
    });
  }

  line() {
    return this.generateChartData().map(data => ({
      type: 'scatter',
      x: data.x,
      y: data.y,
      name: data.name,
      mode: 'lines',
    }));
  }

  bar() {
    return this.generateChartData().map(data => ({
      type: 'bar',
      x: data.x,
      y: data.y,
      name: data.name,
    }));
  }

  area() {
    return this.generateChartData().map(data => ({
      type: 'scatter',
      x: data.x,
      y: data.y,
      name: data.name,
      mode: 'lines',
      fill: 'tozeroy',
    }));
  }

  pie() {
    return [{
      type: 'pie',
      labels: this.dataByField(this.props.x),
      values: this.dataByField(this.props.y[0]),
    }];
  }

  componentDidMount() {
    this.draw();
  }

  componentDidUpdate() {
    this.draw();
  }

  dataByField(fieldName) {
    return this.props.rows.map(r => r[fieldName]);
  }

  render() {
    return <div className="Chart" />;
  }
}
