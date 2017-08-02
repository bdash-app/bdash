import test from 'ava';
import GitHubApiClient from '../../app/lib/GitHubApiClient';

test(t => {
  let url = 'https://ghe.example.com/api/v3';
  let client = new GitHubApiClient({ url });

  t.true(/^https:\/\/ghe\.example\.com\/api\/v3\/\?_=\d+$/.test(client.getValidationTokenUrl()));
  t.is(client.getGistUrl(), 'https://ghe.example.com/api/v3/gists');
});

test(t => {
  let url = 'https://ghe.example.com/api/v3///';
  let client = new GitHubApiClient({ url });

  t.true(/^https:\/\/ghe\.example\.com\/api\/v3\/\?_=\d+$/.test(client.getValidationTokenUrl()));
  t.is(client.getGistUrl(), 'https://ghe.example.com/api/v3/gists');
});

test(t => {
  let client = new GitHubApiClient({});

  t.true(/^https:\/\/api\.github\.com\/\?_=\d+$/.test(client.getValidationTokenUrl()));
  t.is(client.getGistUrl(), 'https://api.github.com/gists');
});
