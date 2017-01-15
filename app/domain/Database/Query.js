import Base from './Base';

export default class Query {
  static getAll() {
    return Base.all('select id, title from queries order by createdAt desc');
  }
}
