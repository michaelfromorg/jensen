#!/bin/bash

brew install nvm

# assumes Linuxbrew
[ -s "/home/linuxbrew/.linuxbrew/opt/nvm/nvm.sh" ] && . "/home/linuxbrew/.linuxbrew/opt/nvm/nvm.sh"  # This loads nvm

nvm install --lts
nvm use --lts

npm install -g @google/clasp
clasp login

pushd server
npm i
popd
