#!/usr/bin/env bash

set -euo pipefail

REPO_DIR="${REPO_DIR:-$HOME/mmetwalli}"
BUILD_DIR="${BUILD_DIR:-$REPO_DIR/dist}"
COMMIT_SHA="${COMMIT_SHA:?COMMIT_SHA must be set}"

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  # shellcheck disable=SC1091
  . "$NVM_DIR/nvm.sh"
fi

for cmd in git npm cp nginx; do
  command -v "$cmd" > /dev/null || { echo "Missing command: $cmd"; exit 1; }
done

cd "$REPO_DIR"

PREVIOUS_SHA="$(git rev-parse HEAD)"
echo "Deploying $COMMIT_SHA (currently on $PREVIOUS_SHA)"

build() {
    npm ci --include=dev
    npm run build
    sudo cp -r "$BUILD_DIR"/* /var/www/mmetwalli/
    sudo nginx -t && sudo systemctl reload nginx
}

rollback() {
  echo "Deploy failed, rolling back to $PREVIOUS_SHA"
  cd "$REPO_DIR"
  git checkout --force "$PREVIOUS_SHA"
  build
  exit 1
}

git fetch --prune origin master
git checkout --force "$COMMIT_SHA"

build || rollback

echo "Deployed $COMMIT_SHA"