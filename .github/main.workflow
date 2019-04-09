workflow "Daily" {
  on = "schedule(5 2 * * *)"
  resolves = ["Create pull request"]
}

action "Rebuild and push" {
  uses = "./"
  runs = ["sh", "scripts/rebuildPush.sh"]
  secrets = ["GITHUB_TOKEN"]
}

action "Create pull request" {
  uses = "vsoch/pull-request-action@master"
  needs = ["Rebuild and push"]
  secrets = ["GITHUB_TOKEN"]
}
