workflow "On push" {
  on = "push"
  resolves = ["Create New Pull Request"]
}

action "Only rebuild branch" {
  uses = "actions/bin/filter@3c98a2679187369a2116d4f311568596d3725740"
  args = "branch rebuild"
}

action "Create New Pull Request" {
  uses = "vsoch/pull-request-action@master"
  needs = "Only rebuild branch"
  secrets = ["GITHUB_TOKEN"]

  env = {
    PULL_REQUEST_BRANCH = "master"
  }
}
