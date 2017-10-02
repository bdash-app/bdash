import Plotly from 'plotly.js/dist/plotly.js';
import _ from 'lodash';

export default class Chart {
  constructor(params) {
    this.params = params;
  }

  drawTo(dom) {
    Plotly.newPlot(dom, this.getData(), this.getLayout(), { displayModeBar: false });
  }

  async toSVG() {
    let data = this.getData();
    let layout = this.getLayout();
    let div = document.createElement('div');

    if (data.length === 0) {
      return Promise.resolve(null);
    }

    let gd = await Plotly.plot(div, data, layout);
    return Plotly.Snapshot.toSVG(gd).replace(/"Open Sans"/g, "'Open Sans'");
  }

  getData() {
    return this[this.params.type]();
  }

  getLayout() {
    let layout = { showlegend: true, margin: { l: 50, r: 50, t: 10, b: 120, pad: 4 }, hoverlabel: { namelength: -1 } };

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

    if (!this.params.groupBy || !this.params.fields.includes(this.params.groupBy)) {
      return this.params.y.map(y => {
        return {
          x: this.dataByField(this.params.x),
          y: this.dataByField(y),
          name: y,
        };
      });
    }

    let groupValues = _.uniq(this.dataByField(this.params.groupBy));
    let idx = this.params.fields.findIndex(field => field === this.params.groupBy);
    let x = _.groupBy(this.params.rows, row => row[idx]);

    return _.flatMap(this.params.y, y => {
      return groupValues.map(g => {
        let groupByIdx = this.rowIndexByFieldName(this.params.groupBy);
        let yIdx = this.rowIndexByFieldName(y);
        return {
          name: `${y} (${g})`,
          x: this.valuesByField(x[g], this.params.x),
          y: this.params.rows
            .filter(row => row[groupByIdx] === g)
            .map(row => row[yIdx]),
        };
      });
    });
  }

  rowIndexByFieldName(field) {
    return this.params.fields.findIndex(f => f === field);
  }

  valuesByField(rows, field) {
    let idx = this.rowIndexByFieldName(field);
    return rows.map(row => row[idx]);
  }

  dataByField(field) {
    return this.valuesByField(this.params.rows, field);
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
