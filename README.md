# cfn-schema

JSON Schema for AWS CloudFormation templates.

![demo1](examples/1.gif)
![demo2](examples/2.gif)

## Schema URL

```
https://cfn-schema.y13i.com/schema
```

You can add query parameters to explicitly specify region and resource spec version.

| Query Parameter Name | Default Value |
| :------------------- | :------------ |
| region               | us-east-1     |
| version              | latest        |

For example...

```
https://cfn-schema.y13i.com/schema?region=eu-west-1&version=20.0.0
```

## Usage

### With [Visual Studio Code](https://code.visualstudio.com/)

Open Workspace Settings by pressing **Ctrl + ,** or **⌘ + ,** and add JSON Schema setting like this.

```json
{
  "json.schemas": [
    {
      "fileMatch": ["*.cfn.json"],
      "url": "https://cfn-schema.y13i.com/schema"
    }
  ]
}
```

Save your template file with the extension `.cfn.json`. That's it.

If you prefer YAML, use [YAML Support by Red Hat](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) extension and set like this.

```json
{
  "yaml.schemas": {
    "https://cfn-schema.y13i.com/schema": "*.cfn.yaml"
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

**From Nov 2020, cfn-schema uses API Gateway and Lambda (deployed by AWS SAM) to convert resource spec to JSON Schema.**

See [base.json](src/base.json) for the base schema. See [build.js](src/build.js) for building logic which merges AWS-providing [Resource Specification](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-resource-specification.html) to the base schema.

### Related Documents

- [AWS CloudFormation Resource Specification - AWS CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-resource-specification.html)
- [Specification Format - AWS CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-resource-specification-format.html)
- [AWS Regions and Endpoints - Amazon Web Services](https://docs.aws.amazon.com/general/latest/gr/rande.html#cfn_region)

### Build

```sh
npm run build
```

### Test

```sh
npm test
```
