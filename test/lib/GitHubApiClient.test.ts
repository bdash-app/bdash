import * as assert from 'assert';
import GitHubApiClient from '../../src/lib/GitHubApiClient';

suite('GitHubApiClient', () => {
  test('valid behavior', () => {
    const url = 'https://ghe.example.com/api/v3';
    const client = new GitHubApiClient({ url, token: null });

    assert.ok(/^https:\/\/ghe\.example\.com\/api\/v3\/\?_=\d+$/.test(client.getValidationTokenUrl()));
    assert.strictEqual(client.getGistUrl(), 'https://ghe.example.com/api/v3/gists');
  });

  test('trailing slash', () => {
    const url = 'https://ghe.example.com/api/v3///';
    const client = new GitHubApiClient({ url, token: null });

    assert.ok(/^https:\/\/ghe\.example\.com\/api\/v3\/\?_=\d+$/.test(client.getValidationTokenUrl()));
    assert.strictEqual(client.getGistUrl(), 'https://ghe.example.com/api/v3/gists');
  });

  test('default url', () => {
    const client = new GitHubApiClient({ url: null, token: null });

    assert.ok(/^https:\/\/api\.github\.com\/\?_=\d+$/.test(client.getValidationTokenUrl()));
    assert.strictEqual(client.getGistUrl(), 'https://api.github.com/gists');
  });
});
