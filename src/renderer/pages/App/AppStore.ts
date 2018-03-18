import Store from "../../flux/Store";

export interface AppState {
  selectedPage: string;
}

export default class AppStore extends Store<AppState> {
  constructor() {
    super();
    this.state = {
      selectedPage: "query"
    };
  }

  reduce(type, payload) {
    switch (type) {
      case "selectPage": {
        return this.set("selectedPage", payload.page);
      }
    }
  }
}

const { store, dispatch } = Store.create(AppStore);
export { store, dispatch };
