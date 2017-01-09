import React from 'react';
import Container from '../../flux/Container';
import { store } from './AppStore';
import AppAction from './AppAction';
import GlobalMenu from '../../components/GlobalMenu';
import Query from '../Query';
import DataSource from '../DataSource';
import Setting from '../Setting';

export default class App extends Container {
  get store() {
    return store;
  }

  getSelectedPage() {
    switch (this.state.selectedPage) {
      case 'query': return Query;
      case 'dataSource': return DataSource;
      case 'setting': return Setting;
      default: throw new Error(`Unknown page: ${this.state.page}`);
    }
  }

  render() {
    let Page = this.getSelectedPage();

    return (
      <div className="page-app">
        <div className="page-app-menu">
          <GlobalMenu
            selectedPage={this.state.selectedPage}
            onSelect={AppAction.selectPage} />
        </div>
        <div className="page-app-main">
          <Page />
        </div>
      </div>
    );
  }
}
