#!/bin/sh

git config user.name ${GITHUB_ACTOR}
git config user.email ${GITHUB_ACTOR}@users.noreply.github.com

TIMESTAMP=`date +%s | tr -d '\n'`

git checkout -b rebuild/${TIMESTAMP}

npm run build

if git diff-index --quiet HEAD --; then
  exit 78
else
  git add .
  git commit -m "rebuild"
  git push "https://${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"
fi

exit $?
