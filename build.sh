#! /bin/bash

cd sanity
yarn
yarn build

cd ../quasar
yarn
yarn build

cd ../aws
yarn
yarn build
yarn test

cd ..
