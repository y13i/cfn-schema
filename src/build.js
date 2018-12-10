const { readFile, writeFile } = require("fs");
const { promisify } = require("util");
const { join } = require("path");
const axios = require("axios");

const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);

const baseSchemaPath = join(__dirname, "base.json");
const outputPath = join(__dirname, "..", "docs");

// https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-resource-specification-format.html
// https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-resource-specification.html
// https://docs.aws.amazon.com/general/latest/gr/rande.html#cfn_region
const resourceSpecUrls = {
  "ap-northeast-1":
    "https://d33vqc0rt9ld30.cloudfront.net/latest/gzip/CloudFormationResourceSpecification.json", // Asia Pacific (Tokyo)
  "ap-northeast-2":
    "https://d1ane3fvebulky.cloudfront.net/latest/gzip/CloudFormationResourceSpecification.json", // Asia Pacific (Seoul)
  "ap-northeast-3":
    "https://d2zq80gdmjim8k.cloudfront.net/latest/gzip/CloudFormationResourceSpecification.json", // Asia Pacific (Osaka-Local)
  "ap-south-1":
    "https://d2senuesg1djtx.cloudfront.net/latest/gzip/CloudFormationResourceSpecification.json", // Asia Pacific (Mumbai)
  "ap-southeast-1":
    "https://doigdx0kgq9el.cloudfront.net/latest/gzip/CloudFormationResourceSpecification.json", // Asia Pacific (Singapore)
  "ap-southeast-2":
    "https://d2stg8d246z9di.cloudfront.net/latest/gzip/CloudFormationResourceSpecification.json", // Asia Pacific (Sydney)
  "ca-central-1":
    "https://d2s8ygphhesbe7.cloudfront.net/latest/gzip/CloudFormationResourceSpecification.json", // Canada (Central)
  "eu-central-1":
    "https://d1mta8qj7i28i2.cloudfront.net/latest/gzip/CloudFormationResourceSpecification.json", // EU (Frankfurt)
  "eu-west-1":
    "https://d3teyb21fexa9r.cloudfront.net/latest/gzip/CloudFormationResourceSpecification.json", // EU (Ireland)
  "eu-west-2":
    "https://d1742qcu2c1ncx.cloudfront.net/latest/gzip/CloudFormationResourceSpecification.json", // EU (London)
  "eu-west-3":
    "https://d2d0mfegowb3wk.cloudfront.net/latest/gzip/CloudFormationResourceSpecification.json", // EU (Paris)
  "sa-east-1":
    "https://d3c9jyj3w509b0.cloudfront.net/latest/gzip/CloudFormationResourceSpecification.json", // South America (São Paulo)
  "us-east-1":
    "https://d1uauaxba7bl26.cloudfront.net/latest/gzip/CloudFormationResourceSpecification.json", // US East (N. Virginia)
  "us-east-2":
    "https://dnwj8swjjbsbt.cloudfront.net/latest/gzip/CloudFormationResourceSpecification.json", // US East (Ohio)
  "us-west-1":
    "https://d68hl49wbnanq.cloudfront.net/latest/gzip/CloudFormationResourceSpecification.json", // US West (N. California)
  "us-west-2":
    "https://d201a2mn26r7lk.cloudfront.net/latest/gzip/CloudFormationResourceSpecification.json" // US West (Oregon)
};

function getPrimitiveTypeSchema(type) {
  switch (type) {
    case "String":
      return {
        type: "string"
      };
    case "Long":
    case "Integer":
      return {
        type: "integer"
      };
    case "Double":
      return {
        type: "number"
      };
    case "Boolean":
      return {
        type: "boolean"
      };
    case "Timestamp":
      return {
        type: "string",
        pattern:
          "\\d{4}-(0\\d|1[0-2])-([0-2]\\d|3[01])T([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d\\.\\d{3}Z",
        default: "1970-01-01T00:00:00.000Z"
      };
    case "Json":
      return {
        type: "object"
      };
  }
}

function referPropertyType(resourceTypeName, itemType) {
  return `#/properties/Resources/definitions/propertyTypes/${
    itemType === "Tag" ? "Tag" : resourceTypeName + "." + itemType
  }`;
}

function appendProperty(root, propertyName, property, resourceTypeName) {
  const p = {
    title: propertyName,
    description: `UpdateType: ${property.UpdateType}, ${property.Documentation}`
  };

  root.properties[propertyName] = p;

  if (property.Required) {
    root.required.push(propertyName);
  }

  if (property.PrimitiveType) {
    p.oneOf = [{ $ref: "#/definitions/intrinsicFunctions" }];

    p.oneOf.unshift(getPrimitiveTypeSchema(property.PrimitiveType));
  } else if (property.Type === "List") {
    p.type = "array";
    p.description = `DuplicatesAllowed: ${property.DuplicatesAllowed}, ${
      p.description
    }`;

    if (property.PrimitiveItemType) {
      p.items = {
        oneOf: [{ $ref: "#/definitions/intrinsicFunctions" }]
      };

      p.items.oneOf.unshift(getPrimitiveTypeSchema(property.PrimitiveItemType));
    } else if (property.ItemType) {
      p.items = {
        $ref: referPropertyType(resourceTypeName, property.ItemType)
      };
    }
  } else if (property.Type === "Map") {
    p.type = "object";

    if (property.PrimitiveItemType) {
      p.additionalProperties = {
        oneOf: [{ $ref: "#/definitions/intrinsicFunctions" }]
      };

      p.additionalProperties.oneOf.unshift(
        getPrimitiveTypeSchema(property.PrimitiveItemType)
      );
    } else if (property.ItemType) {
      p.additionalProperties = {
        $ref: referPropertyType(resourceTypeName, property.ItemType)
      };
    }
  } else if (property.Type) {
    p.$ref = referPropertyType(resourceTypeName, property.Type);
  }
}

function appendPropertyTypes(schema, propertyTypes) {
  Object.keys(propertyTypes)
    .sort()
    .forEach(propertyName => {
      const property = propertyTypes[propertyName];
      const resourceTypeName = propertyName.split(".")[0];

      const p = {
        title: propertyName,
        description: property.Documentation,
        type: "object",
        required: [],
        properties: {},
        additionalProperties: false
      };

      schema.properties.Resources.definitions.propertyTypes[propertyName] = p;

      Object.entries(property.Properties).forEach(
        ([subPropertyName, subProperty]) => {
          appendProperty(p, subPropertyName, subProperty, resourceTypeName);
        }
      );
    });
}

function appendResourceTypes(schema, resourceTypes) {
  Object.keys(resourceTypes)
    .sort()
    .forEach(resourceTypeName => {
      const resourceType = resourceTypes[resourceTypeName];

      const rt = {
        title: resourceTypeName,
        description: resourceType.Documentation,
        type: "object",
        required: [],
        properties: {},
        additionalProperties: false
      };

      schema.properties.Resources.definitions.resourcePropertyTypes[
        resourceTypeName
      ] = rt;

      Object.entries(resourceType.Properties).forEach(
        ([propertyName, property]) => {
          appendProperty(rt, propertyName, property, resourceTypeName);
        }
      );

      schema.properties.Resources.definitions.resourceTypes[
        resourceTypeName
      ] = {
        title: resourceTypeName,
        description: resourceType.Documentation,

        allOf: [
          { $ref: "#/properties/Resources/definitions/resourceTypeBase" },
          {
            required: Object.values(resourceType.Properties).some(
              p => p.Required
            )
              ? ["Type", "Properties"]
              : ["Type"],
            properties: {
              Type: {
                enum: [resourceTypeName]
              },
              Properties: {
                $ref: `#/properties/Resources/definitions/resourcePropertyTypes/${resourceTypeName}`
              }
            }
          }
        ]
      };

      schema.properties.Resources.additionalProperties.oneOf.push({
        $ref: `#/properties/Resources/definitions/resourceTypes/${resourceTypeName}`
      });
    });
}

async function buildSchema(schema, resourceSpecUrl) {
  const resourceSpecResponse = await axios.get(resourceSpecUrl);
  const resourceSpec = resourceSpecResponse.data;

  schema.description += ` automatically generated with resource specification version ${
    resourceSpec.ResourceSpecificationVersion
  } ${resourceSpecUrl}`;

  appendPropertyTypes(schema, resourceSpec.PropertyTypes);
  appendResourceTypes(schema, resourceSpec.ResourceTypes);

  return schema;
}

async function main() {
  const baseJson = await readFileAsync(baseSchemaPath);

  await Promise.all(
    Object.entries(resourceSpecUrls).map(async ([region, resourceSpecUrl]) => {
      const schema = await buildSchema(JSON.parse(baseJson), resourceSpecUrl);

      await Promise.all([
        writeFileAsync(
          join(outputPath, `${region}.json`),
          JSON.stringify(schema, undefined, 2) + "\n"
        ),

        writeFileAsync(
          join(outputPath, `${region}.min.json`),
          JSON.stringify(schema)
        )
      ]);
    })
  );
}

main().then(() => console.log("done."));
