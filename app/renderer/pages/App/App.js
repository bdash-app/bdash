import React from 'react';
import Container from '../../flux/Container';
import LoadingIcon from '../../components/LoadingIcon';
import GlobalMenu from '../../components/GlobalMenu';
import { FrameSet, Frame } from '../../components/FlexibleFrame';
import { store } from './AppStore';
import Action from './AppAction';
import Query from '../Query';
import DataSource from '../DataSource';
import Setting from '../Setting';

class App extends React.Component {
  componentDidMount() {
    Action.initialize();
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

    return <FrameSet direction="row" className="page-app">
      <Frame width="48" className="page-app-menu">
        <GlobalMenu
          selectedPage={this.state.selectedPage}
          onSelect={Action.selectPage} />
      </Frame>
      <Page />
    </FrameSet>;
  }
}

export default Container.create(App, store);
