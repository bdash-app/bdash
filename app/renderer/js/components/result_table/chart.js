import React from 'react';
import ReactDOM from 'react-dom';
import Plotly from 'plotly.js/dist/plotly.js';

export default class Chart extends React.Component {
  draw() {
    let chart = ReactDOM.findDOMNode(this);
    let params = this[this.props.type]();
    let layout = { showlegend: true, margin: { l: 50, r: 50, t: 10, b: 120, pad: 4 } };
    if (this.props.stack === 'enable') {
      layout.barmode = 'stack';
    }
    if (this.props.stack === 'percent') {
      layout.barmode = 'stack';
      layout.barnorm = 'percent';
    }
    Plotly.newPlot(chart, params, layout, { displayModeBar: false });
  }

  line() {
    return this.props.y.map(y => ({
      type: 'scatter',
      x: this.dataByField(this.props.x),
      y: this.dataByField(y),
      name: y,
      mode: 'lines',
    }));
  }

  bar() {
    return this.props.y.map(y => ({
      type: 'bar',
      x: this.dataByField(this.props.x),
      y: this.dataByField(y),
      name: y,
    }));
  }

  area() {
    return this.props.y.map(y => ({
      type: 'scatter',
      x: this.dataByField(this.props.x),
      y: this.dataByField(y),
      name: y,
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
