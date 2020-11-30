exports.handler = async () => {
  return {
    statusCode: 302,
    headers: {
      "Location": require("./package.json").homepage
    }
  };
};
