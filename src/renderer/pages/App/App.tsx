import React from "react";
import Container from "../../flux/Container";
import GlobalMenu from "../../components/GlobalMenu";
import { store, AppState } from "./AppStore";
import Action from "./AppAction";
import Query from "../Query";
import DataSource from "../DataSource";
import Setting from "../Setting";

class App extends React.Component<{}, AppState> {
  componentDidMount(): void {
    Action.initialize();
  }

  getSelectedPage(): typeof Query | typeof DataSource | typeof Setting {
    switch (this.state.selectedPage) {
      case "query":
        return Query;
      case "dataSource":
        return DataSource;
      case "setting":
        return Setting;
      default:
        throw new Error(`Unknown page: ${this.state.selectedPage}`);
    }
  }

  render(): React.ReactNode {
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
