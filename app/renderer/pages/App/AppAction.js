import { dispatch } from './AppStore';

export function selectPage(page) {
  dispatch('selectPage', { page });
}

export default {
  selectPage,
};
