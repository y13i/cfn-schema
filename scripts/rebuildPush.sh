#!/bin/bash

set -x

git config user.name ${GITHUB_ACTOR}
git config user.email ${GITHUB_ACTOR}@users.noreply.github.com

TIMESTAMP=`date +%s | tr -d '\n'`
BRANCH="rebuild/${TIMESTAMP}"

git checkout -b rebuild/${TIMESTAMP}
git remote set-url origin "https://${GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"

npm install
npm run build

if git diff-index --quiet HEAD --; then
  exit 78
else
  git add .
  git commit -m "rebuild"
  git push origin ${BRANCH}
fi

exit $?
