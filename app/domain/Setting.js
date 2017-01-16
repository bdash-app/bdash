import fs from 'fs';
import yaml from 'js-yaml';
import Config from './Config';

export default class Setting {
  constructor(filePath) {
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
    let setting = Object.assign(this.setting, params);
    fs.writeFileSync(this.filePath, yaml.safeDump(setting));
  }
}

export let setting = new Setting(Config.settingPath);
