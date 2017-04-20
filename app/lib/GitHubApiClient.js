const GITHUB_COM_URL = 'https://api.github.com';

export default class GitHubApiClient {
  constructor({ token, url }) {
    this.baseUrl = url;
    this.token = token;
  }

  get headers() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `token ${this.token}`,
    };
  }

  getUrl(path) {
    let baseUrl =  this.baseUrl || GITHUB_COM_URL;
    return baseUrl + path;
  }

  async validateToken() {
    let response = await fetch(this.getUrl(`/?_=${Date.now()}`), { headers: this.headers });
    let scopes = response.headers.get('X-OAuth-Scopes');

    if (!scopes) {
      throw new Error('Invalid');
    }

    let isInclude = scopes.split(',').map(s => s.trim()).includes('gist');
    if (isInclude) {
      return true;
    }
    else {
      throw new Error('gist scope is not included');
    }
  }

  async postToGist(contents) {
    let response = await fetch(this.getUrl('/gists'), {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(Object.assign({ public: false }, contents)),
    });

    if (response.ok) {
      return response.json();
    }
    else {
      throw new Error(`${response.status} ${response.statusText}`);
    }
  }
}
