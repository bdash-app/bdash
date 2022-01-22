const GITHUB_COM_URL = "https://api.github.com";

export default class GitHubApiClient {
  readonly baseUrl: string;
  readonly token: string | null;

  constructor({ token, url }: { token: string | null; url: string | null }) {
    this.baseUrl = url || GITHUB_COM_URL;
    this.token = token;
  }

  getHeaders(): { [name: string]: string } {
    return {
      "Content-Type": "application/json",
      Authorization: `token ${this.token}`,
    };
  }

  generateFullUrl(path: string): string {
    return this.baseUrl.replace(/\/+$/, "") + path;
  }

  getValidationTokenUrl(): string {
    return this.generateFullUrl(`/?_=${Date.now()}`);
  }

  getGistUrl(): string {
    return this.generateFullUrl("/gists");
  }

  async validateToken(): Promise<true> {
    if (!this.token || this.token.length === 0) {
      throw new Error("Token is not set");
    }
    const response = await fetch(this.getValidationTokenUrl(), {
      headers: this.getHeaders(),
    });
    const scopes = response.headers.get("X-OAuth-Scopes");

    if (!scopes) {
      throw new Error("Invalid");
    }

    const isInclude = scopes
      .split(",")
      .map((s) => s.trim())
      .includes("gist");
    if (isInclude) {
      return true;
    } else {
      throw new Error("gist scope is not included");
    }
  }

  async postToGist(contents: any): Promise<any> {
    const response = await fetch(this.getGistUrl(), {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(contents),
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    try {
      return await response.json();
    } catch (err) {
      throw new Error("Invalid response.");
    }
  }
}
