import React from 'react';
import QueryList from '../../components/QueryList';
import { store } from './QueryStore';
import QueryAction from './QueryAction';
import Container from '../../flux/Container';

export default class Query extends Container {
  constructor(...args) {
    super(...args);
    this.connect(store);
  }

  componentDidMount() {
    QueryAction.initialize();
  }

  handleAddQuery() {
    let ds = this.state.dataSources[0];
    if (ds) {
      QueryAction.addNewQuery({ dataSourceId: ds.id });
    }
    else {
      alert('Please create data source');
    }
  }

  render() {
    let query = this.state.queries.find(query => query.id === this.state.selectedQueryId);
        // <QueryPanelHeader query={query} {...this.props} />
        // <QueryEditor query={query} {...this.props} />
        // <QueryResult query={query} {...this.props} />

    return <div className="page-Query">
      <div className="page-Query-list">
        <QueryList {...this.state}
          onAddQuery={() => this.handleAddQuery()}
          onSelectQuery={QueryAction.selectQuery}
          onDeleteQuery={QueryAction.deleteQuery}
          />
      </div>
      <div className="page-Query-main">
      </div>
    </div>;
  }
}
