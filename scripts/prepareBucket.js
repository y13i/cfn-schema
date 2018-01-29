const {config, STS, S3} = require('aws-sdk');

const sts = new STS();
const s3 = new S3();

if (!config.region) {
  console.log('Set `$AWS_REGION` environment variable.');
  process.exit(1);
}

let Bucket;

Promise.resolve().then(() => {
  return sts.getCallerIdentity().promise();
}).then(callerIdentity => {
  Bucket = `cfn.${callerIdentity.Account}.${config.region}`;

  return s3.getBucketLocation({Bucket}).promise();
}).then(getBucketLocationOutput => {
  const region = getBucketLocationOutput.LocationConstraint;

  if (region === config.region || (config.region === 'us-east-1' && region === '')) {
    process.exit(0);
  } else {
    console.log(`Bucket \`${Bucket}\` is not in region \`${config.region}\`.`);
    process.exit(1);
  }
}).catch(error => {
  if (error.name === 'NoSuchBucket') {
    return s3.createBucket({
      Bucket,

      CreateBucketConfiguration: (config.region === 'us-east-1' ? undefined : {
        LocationConstraint: config.region,
      }),
    }).promise();
  } else {
    console.log(error);
    process.exit(1);
  }
}).then(createBucketOutput => {
  console.log('Bucket created', createBucketOutput);
}).catch(error => {
  console.log(error);
});
