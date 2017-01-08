import React from 'react';
import GlobalMenu from '../../components/GlobalMenu';
import Query from '../Query';
import DataSource from '../DataSource';
import Setting from '../Setting';

const DEFAULT_PAGE = 'query';

export default class App extends React.Component {
  constructor() {
    super();
    this.state = { page: DEFAULT_PAGE };
  }

  getSelectedPage() {
    switch (this.state.page) {
    case 'query': return Query;
    case 'dataSource': return DataSource;
    case 'setting': return Setting;
    default: throw new Error(`Unknown page: ${this.state.page}`);
    }
  }

  handleSelectMenu(page) {
    this.setState({ page });
  }

  render() {
    let Page = this.getSelectedPage();

    return (
      <div className="page-app">
        <div className="page-app-menu">
          <GlobalMenu {...this.state} onSelect={this.handleSelectMenu.bind(this)} />
        </div>
        <div className="page-app-main">
          <Page {...this.state} />
        </div>
      </div>
    );
  }
}
