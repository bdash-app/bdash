import Database from './';

export default class Query {
  static getAll() {
    return Database.all('select id, title from queries order by createdAt desc');
  }
}
