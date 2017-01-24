import fs from 'fs';
import Database from '../../../lib/Database';
import { setting } from '../../../lib/Setting';
import Config from '../../../lib/Config';
import { dispatch } from './AppStore';

export default {
  initialize() {
    if (!fs.existsSync(Config.bdashRoot)) {
      fs.mkdirSync(Config.bdashRoot);
    }

    let databasePath = Config.databasePath;
    let schema = fs.readFileSync(Config.schemaPath).toString();

    setting.initialize(Config.settingPath);

    Database.connection.initialize({ databasePath, schema }).then(() => {
      dispatch('initialize');
    });
  },

  selectPage(page) {
    dispatch('selectPage', { page });
  },
};
