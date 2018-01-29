module.exports.handler = (e, c, b) => {
  console.log(JSON.stringify(e));
  b(null, {
    statusCode: 200,
    headers: {},
    body: JSON.stringify(e),
  });
}
