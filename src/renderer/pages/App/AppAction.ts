import Database from "../../../lib/Database";
import { dispatch } from "./AppStore";
import DataSourceAction from "../DataSource/DataSourceAction";

const AppAction = {
  async initialize() {
    // on boarding
    const count = await Database.DataSource.count();
    if (count === 0) {
      dispatch("selectPage", { page: "dataSource" });
      DataSourceAction.showForm();
    }
  },

  selectPage(page) {
    dispatch("selectPage", { page });
  }
};

export default AppAction;
