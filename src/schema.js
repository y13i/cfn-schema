const axios = require("axios");
const { STATUS_CODES } = require("http");
const { readFile } = require("fs").promises;

const regions = require("./regions.json");
const { buildSchema } = require("./build");

const defaultVersion = "latest";
const defaultRegion = "us-east-1";

const baseResponse = {
  statusCode: 200,
  headers: {
    "Content-Type": "application/json"
  },
};

function buildSuccessfulResponse(content) {
  return { ...baseResponse, body: JSON.stringify(content) };
}

function buildErrorResponse(code, ...messages) {
  return { ...baseResponse, statusCode: code, body: JSON.stringify({ error: [STATUS_CODES[`${code}`], ...messages].join(": ") }) };
}

function buildResourceSpecUrl(baseUrl, version) {
  return `${baseUrl}/${version}/gzip/CloudFormationResourceSpecification.json`
}

exports.handler = async event => {
  try {
    const requestedVersion = (event.queryStringParameters || {}).version || defaultVersion;
    const requestedRegion = (event.queryStringParameters || {}).region || defaultRegion;

    const region = regions.find(r => r.code === requestedRegion);

    if (!region) return buildErrorResponse(404, `Invalid region code: ${requestedRegion}`);

    const resourceSpecUrl = buildResourceSpecUrl(region.baseUrl, requestedVersion);
    const resourceSpecResponse = await axios.get(resourceSpecUrl);

    const baseSchema = JSON.parse(await readFile("./base.json"));
    const schema = buildSchema(baseSchema, resourceSpecResponse.data, resourceSpecUrl);

    return buildSuccessfulResponse(schema);
  } catch (error) {
    console.error(error);
    return buildErrorResponse(500, error.message);
  }
};
