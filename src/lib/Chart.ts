import Plotly, { PlotlyHTMLElement } from "plotly.js-basic-dist-min";
import _ from "lodash";

type Params = {
  readonly type: "line" | "scatter" | "bar" | "area" | "pie";
  readonly stacking: 0 | string;
  readonly groupBy: string[];
  readonly rows: (string | number)[][];
  readonly fields: string[];
  readonly x: string;
  readonly y: string[];
};

export default class Chart {
  private readonly params: Params;

  constructor(params: Params) {
    this.params = params;
  }

  drawTo(dom: HTMLElement): Promise<PlotlyHTMLElement> {
    return Plotly.newPlot(dom, this.getData(), this.getLayout(), {
      displayModeBar: false,
      responsive: true
    });
  }

  async toSVG({ width }: { width: number }): Promise<string | null> {
    const data = this.getData();
    const layout = this.getLayout();
    const div = document.createElement("div");

    if (data.length === 0) {
      return Promise.resolve(null);
    }

    const gd = await Plotly.plot(div, data, layout);
    // aspect ratio (450:700) is default of plotly.js
    // https://plot.ly/javascript/reference/#layout-width
    // https://plot.ly/javascript/reference/#layout-height
    const height = Math.floor((width * 450) / 700);
    return Plotly.toImage(gd, { format: "svg", width, height }).then(svg => {
      const dataURI = decodeURIComponent(svg);
      return dataURI.substr(dataURI.indexOf(",") + 1).replace(/"Open Sans"/g, "'Open Sans'");
    });
  }

  getData(): Partial<Plotly.PlotData>[] {
    return this[this.params.type]();
  }

  getLayout(): Partial<Plotly.Layout> {
    const layout: Partial<Plotly.Layout> = {
      showlegend: true,
      margin: { l: 50, r: 50, t: 10, b: 10, pad: 4 },
      hoverlabel: { namelength: -1 },
      xaxis: { automargin: true },
      yaxis: { automargin: true }
    };

    if (this.params.stacking === "enable") {
      layout.barmode = "stack";
    }
    if (this.params.stacking === "percent") {
      layout.barmode = "stack";
      layout.barnorm = "percent";
    }

    return layout;
  }

  // TODO: Performance tuning
  generateChartData(): { x: (string | number)[]; y: (string | number)[]; name: string }[] {
    if (!this.params.y) return [];

    if (this.params.groupBy.length == 0 || _.difference(this.params.groupBy, this.params.fields).length > 0) {
      return this.params.y.map(y => {
        return {
          x: this.dataByField(this.params.x),
          y: this.dataByField(y),
          name: y
        };
      });
    }

    // NOTE: Can delete sort?
    const groupValues = this.params.groupBy.map(field => _.uniq(this.dataByField(field)).sort());
    const indices = this.params.groupBy.map(field => this.rowIndexByFieldName(field));
    const x = _.groupBy(this.params.rows, row => indices.map(idx => row[idx]));

    // The cartesian product of group values
    const groupPairs = groupValues.reduce((a: any[][], b: any[]) => (
      _.flatMap(a, x => (
        b.map(y => x.concat([y])
      ))
    )), [[]]);

    return _.flatMap(this.params.y, y => {
      const yIdx = this.rowIndexByFieldName(y);
      return groupPairs.map(g => {
        const key = g.join(',');
        return {
          name: `${y} (${key})`,
          x: this.valuesByField(x.hasOwnProperty(key) ? x[key] : [], this.params.x),
          y: this.params.rows.filter(row => (
            // For all group by indices, the values in row and g match.
            indices.reduce((a: boolean, b: number, i) => a && row[b] === g[i], true)
          )).map(row => row[yIdx])
        };
      });
    });
  }

  rowIndexByFieldName(field: string): number {
    return this.params.fields.findIndex(f => f === field);
  }

  valuesByField(rows: (string | number)[][], field: string): (string | number)[] {
    const idx = this.rowIndexByFieldName(field);
    return rows.map(row => row[idx]);
  }

  dataByField(field: string): (string | number)[] {
    return this.valuesByField(this.params.rows, field);
  }

  line(): Partial<Plotly.PlotData>[] {
    return this.generateChartData().map(data => ({
      type: "scatter",
      x: data.x,
      y: data.y,
      name: data.name,
      mode: "lines"
    }));
  }

  scatter(): Partial<Plotly.PlotData>[] {
    return this.generateChartData().map(data => ({
      type: "scatter",
      x: data.x,
      y: data.y,
      name: data.name,
      mode: "markers",
      marker: { size: 10 }
    }));
  }

  bar(): Partial<Plotly.PlotData>[] {
    return this.generateChartData().map(data => ({
      type: "bar",
      x: data.x,
      y: data.y,
      name: data.name
    }));
  }

  area(): Partial<Plotly.PlotData>[] {
    return this.generateChartData().map(data => ({
      type: "scatter",
      x: data.x,
      y: data.y,
      name: data.name,
      mode: "lines",
      fill: "tozeroy"
    }));
  }

  pie(): Partial<Plotly.PlotData>[] {
    return [
      {
        type: "pie",
        direction: "clockwise",
        labels: this.dataByField(this.params.x),
        values: this.dataByField(this.params.y[0])
      }
    ];
  }
}
