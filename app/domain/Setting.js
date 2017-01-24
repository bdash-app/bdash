import fs from 'fs';
import yaml from 'js-yaml';
import _ from 'lodash';

export default class Setting {
  static getDefault() {
    return {
      keyBind: 'default',
      github: {
        token: null,
        url: null,
      },
    };
  }

  initialize(filePath) {
    this.filePath = filePath;

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '');
    }

    this.setting = yaml.safeLoad(fs.readFileSync(filePath).toString()) || {};
  }

  load() {
    return this.setting;
  }

  save(params) {
    let setting = _.merge(this.setting, params);
    fs.writeFileSync(this.filePath, yaml.safeDump(setting));
  }
}

export let setting = new Setting();
