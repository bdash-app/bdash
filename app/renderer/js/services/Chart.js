import Plotly from 'plotly.js/dist/plotly.js';
import _ from 'lodash';

export default class Chart {
  constructor(params) {
    this.params = params;
  }

  drawTo(dom) {
    Plotly.newPlot(dom, this.getData(), this.getLayout(), { displayModeBar: false });
  }

  toSVG() {
    let data = this.getData();
    let layout = this.getLayout();
    let div = document.createElement('div');

    if (data.length === 0) {
      return Promise.resolve(null);
    }

    return Plotly.plot(div, data, layout).then(gd => {
      return Plotly.Snapshot.toSVG(gd).replace(/"Open Sans"/g, "'Open Sans'");
    });
  }

  getData() {
    return this[this.params.type]();
  }

  getLayout() {
    let layout = { showlegend: true, margin: { l: 50, r: 50, t: 10, b: 120, pad: 4 } };

    if (this.params.stacking === 'enable') {
      layout.barmode = 'stack';
    }
    if (this.params.stacking === 'percent') {
      layout.barmode = 'stack';
      layout.barnorm = 'percent';
    }

    return layout;
  }

  // TODO: Performance tuning
  generateChartData() {
    if (!this.params.y) return [];

    let fields = Object.keys(this.params.rows[0]);

    if (!this.params.groupBy || !fields.includes(this.params.groupBy)) {
      return this.params.y.map(y => {
        return {
          x: this.dataByField(this.params.x),
          y: this.dataByField(y),
          name: y,
        };
      });
    }

    let groupValues = _.uniq(this.dataByField(this.params.groupBy)).sort();
    let x = _.groupBy(this.params.rows, row => row[this.params.groupBy]);

    return _.flatMap(this.params.y, y => {
      return groupValues.map(g => ({
        name: `${y} (${g})`,
        x: x[g].map(row => row[this.params.x]),
        y: this.params.rows
          .filter(row => row[this.params.groupBy] === g)
          .map(row => row[y]),
      }));
    });
  }

  dataByField(fieldName) {
    return this.params.rows.map(r => r[fieldName]);
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
      labels: this.dataByField(this.params.x),
      values: this.dataByField(this.params.y[0]),
    }];
  }
}
