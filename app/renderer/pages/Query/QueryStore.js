import Setting from '../../../lib/Setting';
import Store from '../../flux/Store';

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
        let idx = this.findQueryIndex(payload.id);
        return this.chain()
          .set('selectedQueryId', payload.id)
          .merge(`queries.${idx}`, payload.query)
          .end();
      }
      case 'addNewQuery': {
        return this.prepend('queries', payload.query);
      }
      case 'updateQuery': {
        let idx = this.findQueryIndex(payload.id);
        return this.merge(`queries.${idx}`, payload.params);
      }
      case 'deleteQuery': {
        let idx = this.findQueryIndex(payload.id);
        return this.del(`queries.${idx}`, payload.id);
      }
    }
  }

  findQueryIndex(id) {
    let idx = this.state.queries.findIndex(q => q.id === id);

    if (idx === undefined) {
      throw new Error(`query id:${id} not found`);
    }

    return idx;
  }
}

let { store, dispatch } = Store.create(QueryStore);
export { store, dispatch };
