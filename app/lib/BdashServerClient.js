const API_VERSION = 1;

export default class BdashServerClient {
  constructor({ endpoint, token }) {
    this.endpoint = endpoint;
    this.token = token;
  }

  get headers() {
    return {
      'Content-Type': 'application/json',
      'X-Bdash-API-Token': `token ${this.token}`,
      'X-Bdash-API-Version': API_VERSION,
    };
  }

  async post({ title, body, result, charts }) {
    let response = await fetch(this.endpoint, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ title, body, result, charts }),
    });

    if (response.ok) {
      return response.json();
    }
    else {
      throw new Error(`${response.status} ${response.statusText}`);
    }
  }
}
