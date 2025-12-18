import { setting, PartialSettingType, ThemeSettingType } from "../../../lib/Setting";
import GitHubApiClient from "../../../lib/GitHubApiClient";
import { dispatch } from "./SettingStore";
import BdashServerClient from "../../../lib/BdashServerClient";
import { updateTheme } from "../../theme";

const SettingAction = {
  initialize(): void {
    dispatch("initialize", { setting: setting.load() });
  },

  async update(params: PartialSettingType): Promise<void> {
    if (params.theme) {
      try {
        await updateTheme(params.theme as ThemeSettingType);
      } catch (err) {
        console.error("Failed to update theme:", err);
        return;
      }
    }
    setting.save(params);
    dispatch("update", { setting: params });
  },

  async validateGithubToken({ url, token }: { url: string | null; token: string | null }): Promise<void> {
    dispatch("githubValidateTokenWorking");

    try {
      await new GitHubApiClient({ url, token }).validateToken();
    } catch (err) {
      dispatch("githubValidateTokenError", { message: err.message });
      return;
    }

    dispatch("githubValidateTokenSuccess");
  },

  async validateBdashServerToken({ url, token }: { url: string | null; token: string | null }): Promise<void> {
    dispatch("bdashServerValidateTokenWorking");

    try {
      await new BdashServerClient({ url, token }).validateToken();
    } catch (err) {
      dispatch("bdashServerValidateTokenError", { message: err.message });
      return;
    }

    dispatch("bdashServerValidateTokenSuccess");
  },
};

export default SettingAction;
