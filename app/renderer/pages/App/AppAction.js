import { dispatch } from './AppStore';
import Database from '../../../domain/Database';

export function initialize() {
  Database.initialize().then(() => {
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
