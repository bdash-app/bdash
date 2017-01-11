import React from 'react';
import QueryList from '../../components/QueryList';
import Database from '../../../domain/Database';

export default class Query extends React.Component {
  constructor() {
    super();

    this.state = {
      queries: [],
      dataSources: [],
      charts: [],
      selectedQueryId: null,
      editorHeight: null,
    };
  }

  componentDidMount() {
    Database.Query.getAll().then(queries => {
      this.setState({ queries });
    });
  }

  handleAddQuery() {
    let defaultDataSource = this.state.dataSources[0];
    if (!defaultDataSource) {
      alert('Please create data source');
      return;
    }

    let params = {
      title: 'New Query',
      dataSourceId: defaultDataSource.id,
    };

    this.db.createQuery(params).then(newQuery => {
      this.setState({
        queries: [newQuery].concat(this.state.queries),
        selectedQueryId: newQuery.id,
      });
    }).catch(err => {
      console.error(err);
    });
  }

  handleSelectQuery(id) {
    this.setState({ selectedQueryId: id });
  }

  handleDeleteQuery(id) {
    let queries = this.state.queries.filter(q => q.id !== id);
    this.setState({ queries, selectedQueryId: null });
    this.db.deleteQuery(id).catch(err => {
      console.error(err);
    });
  }

  render() {
    let query = this.state.queries.find(query => query.id === this.props.selectedQueryId);
        // <QueryPanelHeader query={query} {...this.props} />
        // <QueryEditor query={query} {...this.props} />
        // <QueryResult query={query} {...this.props} />

    return <div className="page-Query">
      <div className="page-Query-list">
        <QueryList {...this.state}
          onAddQuery={this.handleAddQuery.bind(this)}
          onSelectQuery={this.handleSelectQuery.bind(this)}
          onDeleteQuery={this.handleDeleteQuery.bind(this)}
          />
      </div>
      <div className="page-Query-main">
      </div>
    </div>;
  }
}
