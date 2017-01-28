import { connection } from './Connection';

export default class Chart {
  static getAll() {
    return connection.all('select id, title from queries order by createdAt desc').then(charts => {
      return charts.map(chart => {
        let yColumns = JSON.parse(chart.yColumns || '[]');
        return Object.assign(chart, { yColumns });
      });
    });
  }
}
