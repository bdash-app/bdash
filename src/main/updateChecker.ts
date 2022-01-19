import { app } from "electron";
import { compare } from "compare-versions";
import fetch from "node-fetch";

const latestReleaseEndpoint = "https://api.github.com/repos/bdash-app/bdash/releases/latest";

export async function checkUpdate(): Promise<boolean> {
  const res = await fetch(latestReleaseEndpoint);
  const json = await res.json();

  const latestVersion = json.name.replace("^v", "");
  const currentVersion = app.getVersion();

  return compare(latestVersion, currentVersion, ">");
}
