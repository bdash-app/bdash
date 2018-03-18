import Store from "../../flux/Store";

export default class AppStore extends Store {
  getInitialState() {
    return {
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
