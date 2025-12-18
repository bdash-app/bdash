import { ipcRenderer } from "electron";
import { ThemeSettingType } from "../lib/Setting";

type NativeThemeState = {
  shouldUseDarkColors: boolean;
  themeSource: ThemeSettingType;
};

let subscribed = false;

const applyBodyClass = (isDark: boolean): void => {
  document.body.classList.toggle("theme-dark", isDark);
  document.body.classList.toggle("theme-light", !isDark);
};

const subscribeNativeTheme = (): void => {
  if (subscribed) return;

  ipcRenderer.on("native-theme-updated", (_event, payload: NativeThemeState) => {
    applyBodyClass(payload.shouldUseDarkColors);
  });

  subscribed = true;
};

const setThemeSource = async (theme: ThemeSettingType): Promise<NativeThemeState> => {
  return ipcRenderer.invoke("setThemeSource", theme);
};

export const initializeTheme = async (theme: ThemeSettingType): Promise<void> => {
  subscribeNativeTheme();
  const state: NativeThemeState = await setThemeSource(theme);
  applyBodyClass(state.shouldUseDarkColors);
};

export const updateTheme = async (theme: ThemeSettingType): Promise<void> => {
  const state: NativeThemeState = await setThemeSource(theme);
  applyBodyClass(state.shouldUseDarkColors);
};
