import Setting, { SettingType } from "../../../lib/Setting";
import Store, { StateBuilder } from "../../flux/Store";

export interface SettingState {
  githubValidateToken: {
    status: string | null;
    error: string | null;
  };
  setting: SettingType;
}

export default class SettingStore extends Store<SettingState> {
  constructor() {
    super();
    this.state = {
      githubValidateToken: {
        status: null,
        error: null
      },
      setting: Setting.getDefault()
    };
  }

  reduce(type: string, payload: any): StateBuilder<SettingState> {
    switch (type) {
      case "initialize":
      case "update": {
        return this.merge("setting", payload.setting);
      }
      case "githubValidateTokenWorking": {
        return this.merge("githubValidateToken", {
          status: "working",
          error: null
        });
      }
      case "githubValidateTokenSuccess": {
        return this.merge("githubValidateToken", {
          status: "success",
          error: null
        });
      }
      case "githubValidateTokenError": {
        return this.merge("githubValidateToken", {
          status: "failure",
          error: payload.message
        });
      }
      default: {
        throw new Error("Invalid type");
      }
    }
  }
}

const { store, dispatch } = Store.create<SettingState>(SettingStore);
export { store, dispatch };
