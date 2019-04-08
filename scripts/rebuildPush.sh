#!/bin/sh

git config user.name ${GITHUB_ACTOR}
git config user.email ${GITHUB_ACTOR}@users.noreply.github.com

TIMESTAMP=`date +%s | tr -d '\n'`

git checkout -b rebuild/${TIMESTAMP}

npm install
npm run build

if git diff-index HEAD -- | grep docs/; then
  git add .
  git commit -m "rebuild"
  git push "https://${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"
else
  exit 78
fi

exit $?
