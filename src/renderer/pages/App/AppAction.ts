import * as fs from 'fs';
import { ensureDirSync } from 'fs-extra';
import Database from '../../../lib/Database';
import { setting } from '../../../lib/Setting';
import Config from '../../../lib/Config';
import { dispatch } from './AppStore';
import DataSourceAction from '../DataSource/DataSourceAction';

const AppAction = {
  async initialize() {
    if (!fs.existsSync(Config.bdashRoot)) {
      ensureDirSync(Config.bdashRoot);
    }

    let databasePath = Config.databasePath;
    let schema = fs.readFileSync(Config.schemaPath).toString();

    setting.initialize(Config.settingPath);

    await Database.connection.initialize({ databasePath, schema });
    dispatch('initialize');

    // on boarding
    let count = await Database.DataSource.count();
    if (count === 0) {
      dispatch('selectPage', { page: 'dataSource' });
      DataSourceAction.showForm();
    }
  },

  selectPage(page) {
    dispatch('selectPage', { page });
  },
};

export default AppAction;
