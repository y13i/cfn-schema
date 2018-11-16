#!/bin/bash -xe

# HUB_VERSION="2.5.1"
#

curl -L -o hub.tgz "https://github.com/github/hub/releases/download/v$HUB_VERSION/hub-linux-amd64-$HUB_VERSION.tgz"
tar -C "$HOME" -zxf "hub.tgz"
export PATH="$PATH:$HOME/hub-linux-amd64-$HUB_VERSION"

if [[ -z "$(git diff --name-only $@)" ]] ; then
  echo "Nothing to do."
else
  TRAVIS_BUILD_URL="https://travis-ci.org/$TRAVIS_REPO_SLUG/builds/$TRAVIS_BUILD_ID"
  COMMIT_MESSAGE="Automatically commited by the cron job $TRAVIS_BUILD_URL"

  git config --global user.name  "$GITHUB_USER"
  git config --global user.email "$GITHUB_USER@users.noreply.github.com"
  git config --global hub.protocol "https"
  git config --global credential.helper "store --file=$HOME/.config/git-credential"

  BRANCH="travis-$TRAVIS_JOB_ID"
  git checkout -b "$BRANCH"
  git commit -am "$GIT_COMMIT_MESSAGE"
  git push origin master
  hub pull-request
fi
