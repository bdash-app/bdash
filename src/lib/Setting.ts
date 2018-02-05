import fs from "fs";
import yaml from "js-yaml";
import _ from "lodash";

export default class Setting {
  static getDefault() {
    return {
      keyBind: "default",
      github: {
        token: null,
        url: null
      }
    };
  }

  filePath: string; // eslint-disable-line no-undef
  setting: any; // eslint-disable-line no-undef

  initialize(filePath) {
    this.filePath = filePath;

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "", { mode: 0o600 });
    }

    this.setting = yaml.safeLoad(fs.readFileSync(filePath).toString()) || {};
  }

  load() {
    return this.setting;
  }

  save(params) {
    const setting = _.merge(this.setting, params);
    fs.writeFileSync(this.filePath, yaml.safeDump(setting));
  }
}

export const setting = new Setting();
