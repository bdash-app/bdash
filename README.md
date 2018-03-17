[![Travis](https://img.shields.io/travis/bdash-app/bdash.svg?style=flat-square&label=Travis+CI)](https://travis-ci.org/bdash-app/bdash)
[![CircleCI](https://img.shields.io/circleci/project/github/bdash-app/bdash.svg?style=flat-square&label=CircleCI)](https://circleci.com/gh/bdash-app/bdash)
[![AppVeyor Build Status](https://img.shields.io/appveyor/ci/bdash-app/bdash/master.svg?style=flat-square&label=AppVeyor&logo=appveyor)](https://ci.appveyor.com/project/bdash-app/bdash/branch/master)

# Bdash

A modern SQL client application.

## Feature

### Saving query

<img width="600" src="./assets/capture1.png">

### Drawing chart

<img width="600" src="./assets/capture2.png">

### Sharing result

You can share the result with gist.

https://gist.github.com/hokaccha/e128e1c3a68527ebf2c50d5e95a089b1

### Multiple data sources support

* [x] MySQL
* [x] PostgreSQL (Redshift)
* [x] BigQuery
* [ ] Amazon Athena
* [x] Treasure Data
* [ ] Hive
* [ ] Impala
* [ ] Presto
* [ ] Microsoft SQL Server
* [ ] And more!

## Installation

You can download and install from [GitHub release](https://github.com/bdash-app/bdash/releases).

## Update

Automatic update is not implemented yet. Download and override from [GitHub release](https://github.com/bdash-app/bdash/releases) manually.

## Support platform

* [x] macOS
* [x] Windows
* [ ] Linux

## Development

You can start the application with following commands.

```
$ cd bdash
$ yarn

# Run following commands with different shell processes.
$ yarn watch
$ yarn start
```

After changing the code, you can reload with `⌘+R` to apply the change.

## License

MIT
