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
const resourceSpecUrls = {
  "ap-south-1":
    "https://d2senuesg1djtx.cloudfront.net/latest/gzip/CloudFormationResourceSpecification.json",
  "ap-northeast-2":
    "https://d1ane3fvebulky.cloudfront.net/latest/gzip/CloudFormationResourceSpecification.json",
  "ap-southeast-2":
    "https://d2stg8d246z9di.cloudfront.net/latest/gzip/CloudFormationResourceSpecification.json",
  "ap-southeast-1":
    "https://doigdx0kgq9el.cloudfront.net/latest/gzip/CloudFormationResourceSpecification.json",
  "ap-northeast-1":
    "https://d33vqc0rt9ld30.cloudfront.net/latest/gzip/CloudFormationResourceSpecification.json",
  "ca-central-1":
    "https://d2s8ygphhesbe7.cloudfront.net/latest/gzip/CloudFormationResourceSpecification.json",
  "eu-central-1":
    "https://d1mta8qj7i28i2.cloudfront.net/latest/gzip/CloudFormationResourceSpecification.json",
  "eu-west-2":
    "https://d1742qcu2c1ncx.cloudfront.net/latest/gzip/CloudFormationResourceSpecification.json",
  "eu-west-1":
    "https://d3teyb21fexa9r.cloudfront.net/latest/gzip/CloudFormationResourceSpecification.json",
  "sa-east-1":
    "https://d3c9jyj3w509b0.cloudfront.net/latest/gzip/CloudFormationResourceSpecification.json",
  "us-east-1":
    "https://d1uauaxba7bl26.cloudfront.net/latest/gzip/CloudFormationResourceSpecification.json",
  "us-east-2":
    "https://dnwj8swjjbsbt.cloudfront.net/latest/gzip/CloudFormationResourceSpecification.json",
  "us-west-1":
    "https://d68hl49wbnanq.cloudfront.net/latest/gzip/CloudFormationResourceSpecification.json",
  "us-west-2":
    "https://d201a2mn26r7lk.cloudfront.net/latest/gzip/CloudFormationResourceSpecification.json"
};

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
    p.anyOf = [{ $ref: "#/definitions/intrinsicFunctions" }];

    switch (property.PrimitiveType) {
      case "String":
        p.anyOf.push({ type: "string" });
        break;
      case "Long":
      case "Integer":
        p.anyOf.push({ type: "integer" });
        break;
      case "Double":
        p.anyOf.push({ type: "number" });
        break;
      case "Boolean":
        p.anyOf.push({ type: "boolean" });
        break;
      case "Timestamp":
        p.anyOf.push({ type: "string" });
        break;
      case "Json":
        p.anyOf.push({ type: "object" });
        break;
    }
  } else if (property.Type === "List") {
    p.type = "array";
    p.description = `DuplicatesAllowed: ${property.DuplicatesAllowed}, ${
      p.description
    }`;

    if (property.PrimitiveItemType) {
      p.items = {
        anyOf: [{ $ref: "#/definitions/intrinsicFunctions" }]
      };

      switch (property.PrimitiveItemType) {
        case "String":
          p.items.anyOf.push({ type: "string" });
          break;
        case "Long":
        case "Integer":
          p.items.anyOf.push({ type: "integer" });
          break;
        case "Double":
          p.items.anyOf.push({ type: "number" });
          break;
        case "Boolean":
          p.items.anyOf.push({ type: "boolean" });
          break;
        case "Timestamp":
          p.items.anyOf.push({ type: "string" });
          break;
      }
    } else if (property.ItemType) {
      p.items = {
        $ref: referPropertyType(resourceTypeName, property.ItemType)
      };
    }
  } else if (property.Type === "Map") {
    p.type = "object";

    if (property.PrimitiveItemType) {
      p.additionalProperties = {
        anyOf: [{ $ref: "#/definitions/intrinsicFunctions" }]
      };

      switch (property.PrimitiveItemType) {
        case "String":
          p.additionalProperties.anyOf.push({ type: "string" });
          break;
        case "Long":
        case "Integer":
          p.additionalProperties.anyOf.push({ type: "integer" });
          break;
        case "Double":
          p.additionalProperties.anyOf.push({ type: "number" });
          break;
        case "Boolean":
          p.additionalProperties.anyOf.push({ type: "boolean" });
          break;
        case "Timestamp":
          p.additionalProperties.anyOf.push({ type: "string" });
          break;
      }
    } else if (property.ItemType) {
      p.additionalProperties = {
        $ref: referPropertyType(resourceTypeName, property.ItemType)
      };
    }
  } else if (property.Type) {
    p.$ref = referPropertyType(resourceTypeName, property.Type);
  }
}

readFileAsync(baseSchemaPath).then(baseJson => {
  return Promise.all(
    Object.entries(resourceSpecUrls).map(([region, resourceSpecUrl]) => {
      return axios.get(resourceSpecUrl).then(response => {
        const resourceSpec = response.data;
        const schema = JSON.parse(baseJson);

        schema.description += ` automatically generated with resource specification version ${
          resourceSpec.ResourceSpecificationVersion
        } ${resourceSpecUrl}`;

        Object.entries(resourceSpec.PropertyTypes).forEach(
          ([propertyName, property]) => {
            const resourceTypeName = propertyName.split(".")[0];

            const p = {
              title: propertyName,
              description: property.Documentation,
              type: "object",
              required: [],
              properties: {},
              additionalProperties: false
            };

            schema.properties.Resources.definitions.propertyTypes[
              propertyName
            ] = p;

            Object.entries(property.Properties).forEach(
              ([subPropertyName, subProperty]) => {
                appendProperty(
                  p,
                  subPropertyName,
                  subProperty,
                  resourceTypeName
                );
              }
            );
          }
        );

        Object.entries(resourceSpec.ResourceTypes).forEach(
          ([resourceTypeName, resourceType]) => {
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
              allOf: [
                { $ref: "#/properties/Resources/definitions/resourceTypeBase" },
                {
                  required: Object.values(resourceType.Properties).some(
                    p => p.Required
                  )
                    ? ["Properties"]
                    : [],
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

            schema.properties.Resources.additionalProperties.anyOf.push({
              $ref: `#/properties/Resources/definitions/resourceTypes/${resourceTypeName}`
            });
          }
        );

        return writeFileAsync(
          join(outputPath, `${region}.json`),
          JSON.stringify(schema, undefined, 2) + "\n"
        );
      });
    })
  );
});
