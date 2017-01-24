import Store from '../../flux/Store';
import Setting from '../../../domain/Setting';

export default class QueryStore extends Store {
  getInitialState() {
    return {
      setting: Setting.getDefault(),
      queries: [],
      dataSources: [],
      charts: [],
      selectedQueryId: null,
      editorHeight: null,
    };
  }

  reduce(type, payload) {
    switch (type) {
      case 'initialize': {
        return this.merge(payload);
      }
      case 'selectQuery': {
        return this.set('selectedQueryId', payload.id);
      }
      case 'addNewQuery': {
        return this.prepend('queries', payload.query);
      }
      case 'deleteQuery': {
        let idx = this.state.queries.findIndex(q => q.id === payload.id);
        return this.del(`queries.${idx}`, payload.id);
      }
    }
  }
}

let { store, dispatch } = Store.create(QueryStore);
export { store, dispatch };
