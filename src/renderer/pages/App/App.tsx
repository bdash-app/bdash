import React from "react";
import Container from "../../flux/Container";
import LoadingIcon from "../../components/LoadingIcon";
import GlobalMenu from "../../components/GlobalMenu";
import { store } from "./AppStore";
import Action from "./AppAction";
import Query from "../Query";
import DataSource from "../DataSource";
import Setting from "../Setting";

class App extends React.Component<any, any> {
  componentDidMount() {
    Action.initialize();
  }

  getSelectedPage() {
    switch (this.state.selectedPage) {
      case "query":
        return Query;
      case "dataSource":
        return DataSource;
      case "setting":
        return Setting;
      default:
        throw new Error(`Unknown page: ${this.state.page}`);
    }
  }

  render() {
    if (!this.state.initialized) {
      return (
        <div className="page-app is-loading">
          <div className="page-app-loading">
            <LoadingIcon />
          </div>
        </div>
      );
    }

    const Page = this.getSelectedPage();

    return (
      <div className="page-app">
        <div className="page-app-menu">
          <GlobalMenu selectedPage={this.state.selectedPage} onSelect={Action.selectPage} />
        </div>
        <div className="page-app-main">
          <Page />
        </div>
      </div>
    );
  }
}

export default Container.create(App, store);
