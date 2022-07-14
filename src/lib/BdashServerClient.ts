export type BdashServerPostResponse = {
  id?: string;
  html_url: string;
};

export default class BdashServerClient {
  readonly baseUrl: string | null;
  readonly token: string | null;

  constructor({ token, url }: { token: string | null; url: string | null }) {
    this.baseUrl = url;
    this.token = token;
  }

  getHeaders(): { [name: string]: string } {
    return {
      "Content-Type": "application/json",
      Authorization: `token ${this.token}`,
    };
  }

  generateFullUrl(path: string): string {
    if (!this.baseUrl) {
      throw new Error("BdashServer URL is not set");
    }
    const url = new URL(this.baseUrl);
    return `${url.origin}/api/bdash-query${path}`;
  }

  getValidationTokenUrl(): string {
    return this.generateFullUrl(`/token_validation`);
  }

  getCreateUrl(): string {
    return this.generateFullUrl("/create");
  }

  getUpdateUrl(): string {
    return this.generateFullUrl("/update");
  }

  getShowUrl(idHash: string): string {
    if (!this.baseUrl) {
      throw new Error("BdashServer URL is not set");
    }
    const url = new URL(this.baseUrl);
    return `${url.origin}/query/${idHash}`;
  }

  async validateToken(): Promise<true> {
    if (!this.token || this.token.length === 0) {
      throw new Error("Token is not set");
    }
    const response = await fetch(this.getValidationTokenUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: this.token }),
    });
    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    const result = await response.json().catch(() => {
      return { message: "Request failed: Response body is invalid JSON" };
    });
    if (!result.ok) {
      throw new Error(result.message);
    }

    return true;
  }

  async post(contents: any): Promise<BdashServerPostResponse> {
    const response = await fetch(this.getCreateUrl(), {
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

  async put(contents: any): Promise<BdashServerPostResponse> {
    const response = await fetch(this.getUpdateUrl(), {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(contents),
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    try {
      return response.json();
    } catch (err) {
      throw new Error("Invalid response.");
    }
  }
}
