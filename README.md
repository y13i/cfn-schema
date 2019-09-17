# cfn-schema

JSON Schema for AWS CloudFormation templates.

![demo1](examples/1.gif)
![demo2](examples/2.gif)

## Schema URLs

- Asia Pacific (Hong Kong)
  - https://y13i.github.io/cfn-schema/ap-east-1.json
  - https://y13i.github.io/cfn-schema/ap-east-1.min.json
- Asia Pacific (Tokyo)
  - https://y13i.github.io/cfn-schema/ap-northeast-1.json
  - https://y13i.github.io/cfn-schema/ap-northeast-1.min.json
- Asia Pacific (Seoul)
  - https://y13i.github.io/cfn-schema/ap-northeast-2.json
  - https://y13i.github.io/cfn-schema/ap-northeast-2.min.json
- Asia Pacific (Osaka-Local)
  - https://y13i.github.io/cfn-schema/ap-northeast-3.json
  - https://y13i.github.io/cfn-schema/ap-northeast-3.min.json
- Asia Pacific (Mumbai)
  - https://y13i.github.io/cfn-schema/ap-south-1.json
  - https://y13i.github.io/cfn-schema/ap-south-1.min.json
- Asia Pacific (Singapore)
  - https://y13i.github.io/cfn-schema/ap-southeast-1.json
  - https://y13i.github.io/cfn-schema/ap-southeast-1.min.json
- Asia Pacific (Sydney)
  - https://y13i.github.io/cfn-schema/ap-southeast-2.json
  - https://y13i.github.io/cfn-schema/ap-southeast-2.min.json
- Canada (Central)
  - https://y13i.github.io/cfn-schema/ca-central-1.json
  - https://y13i.github.io/cfn-schema/ca-central-1.min.json
- China (Beijing)
  - https://y13i.github.io/cfn-schema/cn-north-1.json
  - https://y13i.github.io/cfn-schema/cn-north-1.min.json
- EU (Frankfurt)
  - https://y13i.github.io/cfn-schema/eu-central-1.json
  - https://y13i.github.io/cfn-schema/eu-central-1.min.json
- EU (Ireland)
  - https://y13i.github.io/cfn-schema/eu-west-1.json
  - https://y13i.github.io/cfn-schema/eu-west-1.min.json
- EU (London)
  - https://y13i.github.io/cfn-schema/eu-west-2.json
  - https://y13i.github.io/cfn-schema/eu-west-2.min.json
- EU (Paris)
  - https://y13i.github.io/cfn-schema/eu-west-3.json
  - https://y13i.github.io/cfn-schema/eu-west-3.min.json
- EU (Stockholm)
  - https://y13i.github.io/cfn-schema/eu-north-1.json
  - https://y13i.github.io/cfn-schema/eu-north-1.min.json
- Middle East (Bahrain)
  - https://y13i.github.io/cfn-schema/me-south-1.json
  - https://y13i.github.io/cfn-schema/me-south-1.min.json
- South America (São Paulo)
  - https://y13i.github.io/cfn-schema/sa-east-1.json
  - https://y13i.github.io/cfn-schema/sa-east-1.min.json
- US East (N. Virginia)
  - https://y13i.github.io/cfn-schema/us-east-1.json
  - https://y13i.github.io/cfn-schema/us-east-1.min.json
- US East (Ohio)
  - https://y13i.github.io/cfn-schema/us-east-2.json
  - https://y13i.github.io/cfn-schema/us-east-2.min.json
- AWS GovCloud (US-East)
  - https://y13i.github.io/cfn-schema/us-gov-east-1.json
  - https://y13i.github.io/cfn-schema/us-gov-east-1.min.json
- AWS GovCloud (US-West)
  - https://y13i.github.io/cfn-schema/us-gov-west-1.json
  - https://y13i.github.io/cfn-schema/us-gov-west-1.min.json
- US West (N. California)
  - https://y13i.github.io/cfn-schema/us-west-1.json
  - https://y13i.github.io/cfn-schema/us-west-1.min.json
- US West (Oregon)
  - https://y13i.github.io/cfn-schema/us-west-2.json
  - https://y13i.github.io/cfn-schema/us-west-2.min.json

## Usage

### With [Visual Studio Code](https://code.visualstudio.com/)

Open Workspace Settings by pressing **Ctrl + ,** or **⌘ + ,**.

Choose schema URL correspondent to AWS region you are going to use and add JSON Schema setting like this.

```json
{
  "json.schemas": [
    {
      "fileMatch": ["*.cfn.json"],
      "url": "https://y13i.github.io/cfn-schema/us-west-2.min.json"
    }
  ]
}
```

Save your template file with the extension `.cfn.json`. That's it.

If you prefer YAML, use [YAML Support by Red Hat](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) extension and set like this.

```json
{
  "yaml.schemas": {
    "https://y13i.github.io/cfn-schema/us-west-2.min.json": "*.cfn.yaml"
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

See [base.json](src/base.json) for the base schema. See [build.js](src/build.js) for building script which merges AWS-providing [Resource Specification](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-resource-specification.html) to the base schema.

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
