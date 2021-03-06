// temporary fix: see base.json too
// "AWS::SSM::Association.ParameterValues"

function getPrimitiveTypeSchema(type) {
  switch (type) {
    case "String":
      return {
        type: "string",
      };
    case "Long":
    case "Integer":
      return {
        type: "integer",
      };
    case "Double":
      return {
        type: "number",
      };
    case "Boolean":
      return {
        type: "boolean",
      };
    case "Timestamp":
      return {
        type: "string",
        pattern:
          "\\d{4}-(0\\d|1[0-2])-([0-2]\\d|3[01])T([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d\\.\\d{3}Z",
        default: "1970-01-01T00:00:00.000Z",
      };
    case "Map":
    case "Json":
      return {
        type: "object",
      };
    default:
      console.log(`Unknown premitive type: ${type}`);
  }
}

function referPropertyType(resourceTypeName, itemType) {
  return `#/properties/Resources/definitions/propertyTypes/${itemType.match(/^(Tag|Json)$/)
    ? itemType
    : resourceTypeName + "." + itemType
    }`;
}

function appendProperty(root, propertyName, property, resourceTypeName) {
  const p = {
    title: propertyName,
    description: `Type: ${property.Type || property.PrimitiveType
      }, UpdateType: ${property.UpdateType}, ${property.Documentation}`,
  };

  root.properties[propertyName] = p;

  if (property.Required) {
    root.required.push(propertyName);
  }

  if (
    property.PrimitiveType ||
    property.Type === "List" ||
    property.Type === "Map"
  ) {
    appendPremitiveOrListOrMap(p, resourceTypeName, property);
  } else if (property.Type) {
    p.$ref = referPropertyType(resourceTypeName, property.Type);
  }
}

function appendPremitiveOrListOrMap(root, resourceTypeName, property) {
  if (property.PrimitiveType) {
    root.oneOf = [{ $ref: "#/definitions/intrinsicFunctions" }];

    root.oneOf.unshift(getPrimitiveTypeSchema(property.PrimitiveType));
  } else if (property.Type === "List") {
    root.type = "array";
    root.description = `${property.DuplicatesAllowed === undefined
      ? ""
      : "DuplicatesAllowed: " + property.DuplicatesAllowed + ", "
      }${root.description}`;

    if (property.PrimitiveItemType) {
      root.items = {
        oneOf: [{ $ref: "#/definitions/intrinsicFunctions" }],
      };

      root.items.oneOf.unshift(
        getPrimitiveTypeSchema(property.PrimitiveItemType)
      );
    } else if (property.ItemType) {
      root.items = {
        $ref: referPropertyType(resourceTypeName, property.ItemType),
      };
    }
  } else if (property.Type === "Map") {
    root.type = "object";

    if (property.PrimitiveItemType) {
      root.additionalProperties = {
        oneOf: [{ $ref: "#/definitions/intrinsicFunctions" }],
      };

      root.additionalProperties.oneOf.unshift(
        getPrimitiveTypeSchema(property.PrimitiveItemType)
      );
    } else if (property.ItemType) {
      root.additionalProperties = {
        $ref: referPropertyType(resourceTypeName, property.ItemType),
      };
    }
  }
}

function appendPropertyTypes(schema, propertyTypes) {
  Object.keys(propertyTypes)
    .sort()
    .forEach((propertyName) => {
      const property = propertyTypes[propertyName];
      const resourceTypeName = propertyName.split(".")[0];

      const p = {
        title: propertyName,
      };

      if (property.Properties) {
        p.description = property.Documentation;
        p.type = "object";
        p.required = [];
        p.properties = {};
        p.additionalProperties = false;

        Object.entries(property.Properties)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .forEach(([subPropertyName, subProperty]) => {
            appendProperty(p, subPropertyName, subProperty, resourceTypeName);
          });
      } else {
        appendPremitiveOrListOrMap(p, resourceTypeName, property);
      }

      schema.properties.Resources.definitions.propertyTypes[propertyName] = p;
    });
}

function appendResourceTypes(schema, resourceTypes) {
  Object.keys(resourceTypes)
    .sort()
    .forEach((resourceTypeName) => {
      const resourceType = resourceTypes[resourceTypeName];

      const rt = {
        title: resourceTypeName,
        description: resourceType.Documentation,
        type: "object",
        required: [],
        properties: {},
        additionalProperties: false,
      };

      schema.properties.Resources.definitions.resourcePropertyTypes[
        resourceTypeName
      ] = rt;

      Object.entries(resourceType.Properties)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .forEach(([propertyName, property]) =>
          appendProperty(rt, propertyName, property, resourceTypeName)
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
              (p) => p.Required
            )
              ? ["Type", "Properties"]
              : ["Type"],
            properties: {
              Type: {
                enum: [resourceTypeName],
              },
              Properties: {
                $ref: `#/properties/Resources/definitions/resourcePropertyTypes/${resourceTypeName}`,
              },
            },
          },
        ],
      };

      schema.properties.Resources.additionalProperties.oneOf.push({
        $ref: `#/properties/Resources/definitions/resourceTypes/${resourceTypeName}`,
      });
    });
}

exports.buildSchema = (schema, resourceSpec, resourceSpecUrl) => {
  schema.description += ` automatically generated with resource specification version ${resourceSpec.ResourceSpecificationVersion} ${resourceSpecUrl}`;

  appendPropertyTypes(schema, resourceSpec.PropertyTypes);
  appendResourceTypes(schema, resourceSpec.ResourceTypes);

  return schema;
}
