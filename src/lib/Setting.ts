import fs from "fs";
import yaml from "js-yaml";
import _ from "lodash";

export const indentValues = [2, 4] as const;
type IndentValue = typeof indentValues[number];
export const DEFAULT_INDENT: IndentValue = 4;

export type SettingType = {
  readonly keyBind: "default" | "vim";
  readonly lineWrap: boolean;
  readonly indent: IndentValue;
  readonly formatter: FormatterSettingType;
  readonly github: GithubSettingType;
  readonly bdashServer: BdashServerSettingType;
  readonly experimentalFeature: ExperimentalFeatureSettingType;
  readonly defaultDataSourceId: number | null;
};

export type FormatterSettingType = {
  toUppercaseKeyword: boolean;
};

export type GithubSettingType = {
  readonly token: string | null;
  readonly url: string | null;
  readonly public: boolean;
  readonly maximumNumberOfRowsOfGist: number;
};

export type BdashServerSettingType = {
  readonly token: string | null;
  readonly url: string | null;
  readonly maximumNumberOfRows: number;
};

export type ExperimentalFeatureSettingType = {
  autoCompleteEnabled: boolean;
};

// type for partial updating parameter.
export type PartialSettingType = { [P in keyof SettingType]?: Partial<SettingType[P]> };

export default class Setting {
  static getDefault(): SettingType {
    return {
      keyBind: "default",
      lineWrap: false,
      indent: DEFAULT_INDENT,
      formatter: {
        toUppercaseKeyword: false
      },
      github: {
        token: null,
        url: null,
        public: false,
        maximumNumberOfRowsOfGist: 10000
      },
      bdashServer: {
        token: null,
        url: null,
        maximumNumberOfRows: 10000
      },
      experimentalFeature: {
        autoCompleteEnabled: false
      },
      defaultDataSourceId: null
    };
  }

  filePath: string;
  setting: SettingType;

  initialize(filePath: string): void {
    this.filePath = filePath;

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "", { mode: 0o600 });
    }

    this.setting =
      {
        ...Setting.getDefault(),
        ...yaml.safeLoad(fs.readFileSync(filePath).toString())
      } || {};
  }

  load(): SettingType {
    return this.setting;
  }

  save(params: PartialSettingType): void {
    const setting = _.merge(this.setting, params);
    fs.writeFileSync(this.filePath, yaml.safeDump(setting));
  }
}

export const setting = new Setting();
