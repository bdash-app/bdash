import { dispatch } from './AppStore';
import Database from '../../../domain/Database';
import Config from '../../../domain/Config';
import fs from 'fs';

export function initialize() {
  if (!fs.existsSync(Config.bdashRoot)) {
    fs.mkdirSync(Config.bdashRoot);
  }

  let databasePath = Config.databasePath;
  let schema = fs.readFileSync(Config.schemaPath).toString();

  Database.Base.initialize({ databasePath, schema }).then(() => {
    dispatch('initialize', { initialized: true });
  });
}

export function selectPage(page) {
  dispatch('selectPage', { page });
}

export default {
  initialize,
  selectPage,
};
