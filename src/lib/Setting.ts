import fs from "fs";
import yaml from "js-yaml";
import _ from "lodash";

export type SettingType = {
  readonly keyBind: "default" | "vim";
  readonly github: GithubSettingType;
  readonly defaultDataSourceId?: number;
};

export type GithubSettingType = {
  readonly token: string | null;
  readonly url: string | null;
};

// type for partial updating parameter.
export type PartialSettingType = { [P in keyof SettingType]?: Partial<SettingType[P]> };

export default class Setting {
  static getDefault(): SettingType {
    return {
      keyBind: "default",
      github: {
        token: null,
        url: null
      },
      defaultDataSourceId: undefined,
    };
  }

  filePath: string;
  setting: SettingType;

  initialize(filePath: string) {
    this.filePath = filePath;

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "", { mode: 0o600 });
    }

    this.setting = yaml.safeLoad(fs.readFileSync(filePath).toString()) || {};
  }

  load(): SettingType {
    return this.setting;
  }

  save(params: PartialSettingType) {
    const setting = _.merge(this.setting, params);
    fs.writeFileSync(this.filePath, yaml.safeDump(setting));
  }
}

export const setting = new Setting();
