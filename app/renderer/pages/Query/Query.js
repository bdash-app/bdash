import React from 'react';
import { store } from './QueryStore';
import QueryAction from './QueryAction';
import Container from '../../flux/Container';
import QueryList from '../../components/QueryList';
import QueryHeader from '../../components/QueryHeader';
import QueryEditor from '../../components/QueryEditor';
import QueryResult from '../../components/QueryResult';

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

  renderMain() {
    let query = this.state.queries.find(query => query.id === this.state.selectedQueryId);
    if (!query) return <div className="page-Query-main" />;

    return <div className="page-Query-main">
      <QueryHeader query={query} {...this.state}
        onChangeTitle={title => QueryAction.updateQuery(query.id, { title })}
        onChangeDataSource={dataSourceId => QueryAction.updateQuery(query.id, { dataSourceId })}
        />
      {/*
      <QueryEditor query={query} {...this.state}
        />
      <QueryResult query={query} {...this.state}
        />
      */}
    </div>;
  }

  render() {
    return <div className="page-Query">
      <div className="page-Query-list">
        <QueryList {...this.state}
          onAddQuery={() => this.handleAddQuery()}
          onSelectQuery={QueryAction.selectQuery}
          onDeleteQuery={QueryAction.deleteQuery}
          />
      </div>
      {this.renderMain()}
    </div>;
  }
}
