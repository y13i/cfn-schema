workflow "On push" {
  on = "push"
  resolves = ["Create pull request"]
}

action "Only rebuild branch" {
  uses = "actions/bin/filter@3c98a2679187369a2116d4f311568596d3725740"
  args = "branch rebuild/*"
}

action "Create pull request" {
  uses = "vsoch/pull-request-action@master"
  needs = ["Only rebuild branch"]
  secrets = ["GITHUB_TOKEN"]
}

workflow "Daily" {
  on = "schedule(50 1 * * *)"
  resolves = ["Rebuild and push"]
}

action "Rebuild and push" {
  uses = "./"
  runs = ["sh", "scripts/rebuildPush.sh"]
  secrets = ["GITHUB_TOKEN"]
}
