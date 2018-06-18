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

readFileAsync(baseSchemaPath).then(baseJson => {
  const baseSchema = JSON.parse(baseJson);

  return Promise.all(
    Object.entries(resourceSpecUrls).map(([region, resourceSpecUrl]) => {
      return axios.get(resourceSpecUrl).then(response => {
        const resourceSpec = response.data;
        const schema = { ...baseSchema };

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
                const sp = {
                  title: subPropertyName,
                  description: `UpdateType: ${subProperty.UpdateType}, ${
                    subProperty.Documentation
                  }`
                };

                p.properties[subPropertyName] = sp;

                if (subProperty.Required) {
                  p.required.push(subPropertyName);
                }

                if (subProperty.PrimitiveType) {
                  sp.anyOf = [{ $ref: "#/definitions/intrinsicFunctions" }];

                  switch (subProperty.PrimitiveType) {
                    case "String":
                      sp.anyOf.push({ type: "string" });
                      break;
                    case "Long":
                    case "Integer":
                      sp.anyOf.push({ type: "integer" });
                      break;
                    case "Double":
                      sp.anyOf.push({ type: "number" });
                      break;
                    case "Boolean":
                      sp.anyOf.push({ type: "boolean" });
                      break;
                    case "Timestamp":
                      sp.anyOf.push({ type: "string" });
                      break;
                    case "Json":
                      sp.anyOf.push({ type: "object" });
                      break;
                  }
                } else if (subProperty.Type === "List") {
                  sp.type = "array";
                  sp.description = `DuplicatesAllowed: ${
                    subProperty.DuplicatesAllowed
                  }, ${sp.description}`;

                  if (subProperty.PrimitiveItemType) {
                    sp.items = {
                      anyOf: [{ $ref: "#/definitions/intrinsicFunctions" }]
                    };

                    switch (subProperty.PrimitiveItemType) {
                      case "String":
                        sp.items.anyOf.push({ type: "string" });
                        break;
                      case "Long":
                      case "Integer":
                        sp.items.anyOf.push({ type: "integer" });
                        break;
                      case "Double":
                        sp.items.anyOf.push({ type: "number" });
                        break;
                      case "Boolean":
                        sp.items.anyOf.push({ type: "boolean" });
                        break;
                      case "Timestamp":
                        sp.items.anyOf.push({ type: "string" });
                        break;
                    }
                  } else if (subProperty.ItemType) {
                    sp.items = {
                      $ref: `#/properties/Resources/definitions/propertyTypes/${resourceTypeName}.${
                        subProperty.ItemType
                      }`
                    };
                  }
                } else if (subProperty.Type === "Map") {
                  sp.type = "object";

                  if (subProperty.PrimitiveItemType) {
                    sp.additionalProperties = {
                      anyOf: [{ $ref: "#/definitions/intrinsicFunctions" }]
                    };

                    switch (subProperty.PrimitiveItemType) {
                      case "String":
                        sp.additionalProperties.anyOf.push({ type: "string" });
                        break;
                      case "Long":
                      case "Integer":
                        sp.additionalProperties.anyOf.push({ type: "integer" });
                        break;
                      case "Double":
                        sp.additionalProperties.anyOf.push({ type: "number" });
                        break;
                      case "Boolean":
                        sp.additionalProperties.anyOf.push({ type: "boolean" });
                        break;
                      case "Timestamp":
                        sp.additionalProperties.anyOf.push({ type: "string" });
                        break;
                    }
                  } else if (subProperty.ItemType) {
                    sp.additionalProperties = {
                      $ref: `#/properties/Resources/definitions/propertyTypes/${resourceTypeName}.${
                        subProperty.ItemType
                      }`
                    };
                  }
                } else if (subProperty.Type) {
                  sp.$ref = `#/properties/Resources/definitions/propertyTypes/${resourceTypeName}.${
                    subProperty.Type
                  }`;
                }
              }
            );
          }
        );

        Object.entries(resourceSpec.ResourceTypes).forEach(
          ([resourceTypeName, resourceType]) => {
            console.log(resourceTypeName);
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
