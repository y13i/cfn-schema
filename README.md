# cfn-schema

JSON Schema for AWS CloudFormation templates.

## Schema URLs

- https://y13i.github.io/cfn-schema/ap-northeast-1.json
- https://y13i.github.io/cfn-schema/ap-northeast-2.json
- https://y13i.github.io/cfn-schema/ap-south-1.json
- https://y13i.github.io/cfn-schema/ap-southeast-1.json
- https://y13i.github.io/cfn-schema/ap-southeast-2.json
- https://y13i.github.io/cfn-schema/ca-central-1.json
- https://y13i.github.io/cfn-schema/eu-central-1.json
- https://y13i.github.io/cfn-schema/eu-west-1.json
- https://y13i.github.io/cfn-schema/eu-west-2.json
- https://y13i.github.io/cfn-schema/sa-east-1.json
- https://y13i.github.io/cfn-schema/us-east-1.json
- https://y13i.github.io/cfn-schema/us-east-2.json
- https://y13i.github.io/cfn-schema/us-west-1.json
- https://y13i.github.io/cfn-schema/us-west-2.json

## Usage

### With [Visual Studio Code](https://code.visualstudio.com/)

Open Workspace Settings by pressing **Ctrl + ,** or **⌘ + ,**.

Choose schema URL correspondent to AWS region you going to use and add JSON Schema setting like this.

```json
{
  "json.schemas": [
    {
      "fileMatch": ["*.cfn.json"],
      "url": "https://y13i.github.io/cfn-schema/us-west-2.json"
    }
  ]
}
```

Save your template file with the extension `.cfn.json`. That's it.

If you prefer YAML, use [YAML Support by Red Hat](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) extension and set like this.

```json
{
  "yaml.schemas": {
    "https://y13i.github.io/cfn-schema/us-west-2.json": "*.cfn.yaml"
  }
}
```

See also...

- [Editing JSON with VS Code](https://code.visualstudio.com/docs/languages/json)
- [Support JSON Schema for YAML files](https://github.com/Microsoft/vscode/issues/1176)

### With other editors

- For Atom - [OmniSharp/atom-json-schema](https://github.com/OmniSharp/atom-json-schema)
- For Vim - [Quramy/vison](https://github.com/Quramy/vison)

## Development

### Build

```sh
npm run build
```

### Test

```sh
npm test
```
