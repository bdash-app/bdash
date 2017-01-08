import fs from 'fs';
import yaml from 'js-yaml';

export default class Setting {
  constructor(filePath, defaultSetting = {}) {
    this.filePath = filePath;

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '');
    }

    this.setting = Object.assign(defaultSetting, yaml.safeLoad(fs.readFileSync(filePath).toString()));
  }

  all() {
    return this.setting;
  }

  update(params) {
    let setting = Object.assign(this.setting, params);
    fs.writeFileSync(this.filePath, yaml.safeDump(setting));
  }
}
