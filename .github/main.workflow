workflow "Daily" {
  on = "schedule(13 8 * * *)"
  resolves = ["Rebuild and push"]
}

action "Rebuild and push" {
  uses = "./"
  runs = ["sh", "scripts/rebuildPush.sh"]
  secrets = ["GITHUB_TOKEN"]
}

workflow "On push to rebuild/* branch, Create Pull Request" {
  on = "push"
  resolves = "Create New Pull Request"
}

action "Create New Pull Request" {
  uses = "vsoch/pull-request-action@master"
  secrets = ["GITHUB_TOKEN"]

  env = {
    BRANCH_PREFIX = "rebuild/"
  }
}
