const GITHUB_COM_URL = "https://api.github.com";

export default class GitHubApiClient {
  baseUrl: string;
  token: string;

  constructor({ token, url }) {
    this.baseUrl = url;
    this.token = token;
  }

  getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `token ${this.token}`
    };
  }

  generateFullUrl(path) {
    let baseUrl = this.baseUrl || GITHUB_COM_URL;
    return baseUrl.replace(/\/+$/, "") + path;
  }

  getValidationTokenUrl() {
    return this.generateFullUrl(`/?_=${Date.now()}`);
  }

  getGistUrl() {
    return this.generateFullUrl("/gists");
  }

  async validateToken() {
    let response = await fetch(this.getValidationTokenUrl(), {
      headers: this.getHeaders()
    });
    let scopes = response.headers.get("X-OAuth-Scopes");

    if (!scopes) {
      throw new Error("Invalid");
    }

    let isInclude = scopes
      .split(",")
      .map(s => s.trim())
      .includes("gist");
    if (isInclude) {
      return true;
    } else {
      throw new Error("gist scope is not included");
    }
  }

  async postToGist(contents) {
    let response = await fetch(this.getGistUrl(), {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(Object.assign({ public: false }, contents))
    });

    if (response.ok) {
      return response.json();
    } else {
      throw new Error(`${response.status} ${response.statusText}`);
    }
  }
}
