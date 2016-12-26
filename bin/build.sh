#!/bin/bash

set -ex

export NODE_ENV=production

rm -rf out
mkdir -p out/tmp/app/renderer
npm run build:app
cp -a app/main.js app/main out/tmp/app
cp -a app/renderer/index.html app/renderer/dist out/tmp/app/renderer
cp -a db yarn.lock package.json out/tmp
cd out/tmp
yarn install
cd -
./node_modules/.bin/electron-rebuild -p -m out/tmp -w sqlite3

VERSION=$(cat package.json | jq -r '.version')
./node_modules/.bin/electron-packager out/tmp Bdash \
  --asar=true \
  --overwrite \
  --icon=./assets/icon.icns \
  --platform=darwin \
  --arch=x64 \
  --out=./out \
  --app-bundle-id=io.bdash \
  --helper-bundle-id=io.bdash.helper \
  --app-version=$VERSION \
  --build-version=$VERSION \
  --app-copyright=hokaccha
./node_modules/.bin/electron-osx-sign out/Bdash-darwin-x64/Bdash.app

cd out/Bdash-darwin-x64
zip -ry Bdash-$VERSION.zip Bdash.app
