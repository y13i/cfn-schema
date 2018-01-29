const {config, STS} = require('aws-sdk');
const {execSync} = require('child_process');

const sts = new STS();

if (!config.region) {
  console.log('Set `$AWS_REGION` environment variable.');
  process.exit(1);
}

let Bucket;

sts.getCallerIdentity().promise().then(callerIdentity => {
  process.env['AWS_DEFAULT_REGION'] = config.region;

  Bucket = `cfn.${callerIdentity.Account}.${config.region}`;

  const packageCommand = [
    'aws',
    'cloudformation',
    'package',
    '--template-file',
    'template.cfn.json',
    '--s3-bucket',
    Bucket,
    '--output-template-file',
    '.cfn/packaged.json',
    '--use-json',
  ].join(' ');

  console.log(packageCommand);
  execSync(packageCommand, {stdio: 'inherit'});

  const deployCommand = [
    'aws',
    'cloudformation',
    'deploy',
    '--template-file',
    '.cfn/packaged.json',
    '--capabilities',
    'CAPABILITY_IAM',
    '--stack-name',
    require('../package.json').name,
  ].join(' ');

  console.log(deployCommand);
  execSync(deployCommand, {stdio: 'inherit'});
}).catch(error => {
  console.log(error);
  process.exit(1);
});
