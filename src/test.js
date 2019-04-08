const { join } = require("path");
const { readFile } = require("fs");
const { promisify } = require("util");

const readFileAsync = promisify(readFile);

const Ajv = require("ajv");
const ajv = new Ajv();

ajv.addMetaSchema(require("ajv/lib/refs/json-schema-draft-06.json"));

let schemaJSON, templateJSON, schema, validate;

beforeAll(async () => {
  [schemaJSON, templateJSON] = await Promise.all([
    readFileAsync(join(__dirname, "..", "docs", "us-west-2.json")),
    readFileAsync(join(__dirname, "..", "examples", "template.cfn.json"))
  ]);

  schema = JSON.parse(schemaJSON);
  validate = ajv.compile(schema);
});

test("Is can create validate function", async () => {
  expect(validate).toBeInstanceOf(Function);
});

test("Is can pass valid template", async () => {
  const template = JSON.parse(templateJSON);
  expect(validate(template)).toBeTruthy();
});

test("Is can deny invalid template", async () => {
  const notValid = { this: 1, is: null, not: [], abc: "a valid template" };
  expect(validate(notValid)).toBeFalsy();
});
