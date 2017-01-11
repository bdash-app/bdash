import React from 'react';
import Container from '../../flux/Container';
import { store } from './AppStore';
import AppAction from './AppAction';
import GlobalMenu from '../../components/GlobalMenu';
import Query from '../Query';
import DataSource from '../DataSource';
import Setting from '../Setting';
import LoadingIcon from '../../components/LoadingIcon';

export default class App extends Container {
  get store() {
    return store;
  }

  componentDidMount() {
    AppAction.initialize();
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
    if (!this.state.initialized) {
      return <div className="page-app is-loading">
        <div className="page-app-loading"><LoadingIcon /></div>
      </div>;
    }

    let Page = this.getSelectedPage();

    return <div className="page-app">
      <div className="page-app-menu">
        <GlobalMenu
          selectedPage={this.state.selectedPage}
          onSelect={AppAction.selectPage} />
      </div>
      <div className="page-app-main">
        <Page />
      </div>
    </div>;
  }
}
