workflow "Daily" {
  on = "schedule(30 6 * * *)"
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

action "Filters for GitHub Actions" {
  uses = "actions/bin/filter@master"
  args = "branch rebuild/*"
}

action "Create New Pull Request" {
  uses = "repetitive/actions/auto-pull-request@master"
  needs = ["Filters for GitHub Actions"]
  secrets = ["GITHUB_TOKEN"]
}
