import { setting, PartialSettingType } from "../../../lib/Setting";
import GitHubApiClient from "../../../lib/GitHubApiClient";
import { dispatch } from "./SettingStore";

const SettingAction = {
  initialize(): void {
    dispatch("initialize", { setting: setting.load() });
  },

  update(params: PartialSettingType): void {
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
  }
};

export default SettingAction;
