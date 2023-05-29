[![GitHub release (latest by date)](https://img.shields.io/github/v/release/bdash-app/bdash)](https://github.com/bdash-app/bdash/releases/latest)
[![Test](https://github.com/bdash-app/bdash/actions/workflows/test.yml/badge.svg)](https://github.com/bdash-app/bdash/actions/workflows/test.yml)

# Bdash

Simple SQL Client for lightweight data analysis.

## Feature

### Saving query

<img width="600" src="https://raw.githubusercontent.com/bdash-app/bdash/1.2.2/assets/capture1.png">

### Drawing chart

<img width="600" src="https://raw.githubusercontent.com/bdash-app/bdash/1.2.2/assets/capture2.png">

### Sharing result

You can share the result with gist.

https://gist.github.com/hokaccha/e128e1c3a68527ebf2c50d5e95a089b1

### Multiple data sources support

* [x] MySQL
* [x] PostgreSQL (Amazon Redshift)
* [x] SQLite3
* [x] Google BigQuery
* [x] Treasure Data
* [x] Amazon Athena

## Installation

You can download and install from [Web Site](https://bdash.hokaccha.dev/) or [Releases](https://github.com/bdash-app/bdash/releases)

## Development

You can start the application with following commands.

```
# Install dependencies
$ yarn

# Run following commands with different shell processes.
$ yarn watch
$ yarn start
```

## Release

To create a draft release on GitHub, run the following command with the next version name:

```sh
$ ./scripts/release v1.xx.x
```

This will trigger GitHub Action jobs to generate application binaries.

Once the jobs have been completed, you can publish the draft release on GitHub. It is recommended to include change logs as part of the release description.

## License

MIT
