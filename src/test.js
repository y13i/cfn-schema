const { join } = require("path");
const { readFile } = require("fs");
const { promisify } = require("util");

const readFileAsync = promisify(readFile);

const Ajv = require("ajv");
const ajv = new Ajv();

ajv.addMetaSchema(require("ajv/lib/refs/json-schema-draft-06.json"));

test("Is valid schema and can validate", async () => {
  const [schemaJSON, templateJSON] = await Promise.all([
    readFileAsync(join(__dirname, "..", "docs", "us-west-2.json")),
    readFileAsync(join(__dirname, "..", "examples", "template.cfn.json"))
  ]);

  const schema = JSON.parse(schemaJSON);
  const validate = ajv.compile(schema);

  expect(validate).toBeInstanceOf(Function);

  const template = JSON.parse(templateJSON);
  expect(validate(template)).toBeTruthy;

  const notValid = { this: 1, is: null, not: [], abc: "a valid template" };

  expect(validate(notValid)).toBeFalsy;
});
