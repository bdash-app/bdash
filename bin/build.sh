#!/bin/bash

set -e

rm -rf out

VERSION=$(cat package.json | jq -r '.version')
./node_modules/.bin/electron-packager . Bdash \
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

cd out/Bdash-darwin-x64
zip -r Bdash-$VERSION.zip Bdash.app
