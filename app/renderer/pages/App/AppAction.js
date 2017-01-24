import { dispatch } from './AppStore';
import Database from '../../../domain/Database';
import { setting } from '../../../domain/Setting';
import Config from '../../../domain/Config';
import fs from 'fs';

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
