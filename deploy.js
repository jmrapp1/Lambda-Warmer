const fs = require('fs');
const execa = require('execa');
require('dotenv').config();

const SCHEDULE_PATH = './schedule_data.json';

function getScheduleData() {
    if (!fs.existsSync(SCHEDULE_PATH)) {
        return;
    }
    const data = JSON.parse(fs.readFileSync(SCHEDULE_PATH));
    data.forEach(d => {
        if (d.invokeArgs) {
            d.invokeArgs = JSON.stringify(d.invokeArgs);
        }
    });
    return JSON.stringify(data);
}

async function processScheduleData() {
    const scheduleData = getScheduleData()
        .replace(/'/g, '\"')
        .split('\\') // CF parses escaped strings weirdly; the split/join is a hack around it
        .join('\\\\');
    if (!scheduleData) {
        console.error('Could not find \'schedule_path.json\'. Please provide.');
    }

    const s3Bucket = process.env.SAM_S3_BUCKET;
    const stackName = process.env.CF_STACK_NAME;
    const awsProfile = process.env.AWS_PROFILE;
    const awsRegion = process.env.AWS_REGION;
    const profileArg = awsProfile ? `--profile ${awsProfile}` : '';

    if (!s3Bucket) {
        console.error('Please provide SAM_S3_BUCKET env property');
        return;
    }
    if (!stackName) {
        console.error('Please provide CF_STACK_NAME env property');
        return;
    }
    if (!awsRegion) {
        console.error('Please provide AWS_REGION env property');
        return;
    }

    console.log(scheduleData)
    try {
        console.log(`Found properties: S3 Bucket=${ s3Bucket }, Region=${awsRegion}, Stack Name=${ stackName }, Profile=${ awsProfile || 'default' }`);
        console.log('Building Typescript');
        await execa.commandSync(`npm run build`);
        console.log('Packaging SAM Template');
        await execa.commandSync(`sam package --template-file template.yml --output-template-file packaged-template.yml --s3-bucket ${ s3Bucket } ${ profileArg }`);
        console.log('Running SAM Deployment. This may take some time.');
        await execa.commandSync(`sam deploy --template-file packaged-template.yml --stack-name ${ stackName } --region ${awsRegion} --capabilities CAPABILITY_IAM ${ profileArg } --parameter-overrides LambdasToWarmJson='${scheduleData}'`);console.log(`Deployed Successfully Under Stack '${stackName}'`);
    } catch (e) {
        console.error('Could not deploy Lambda Warmer: ' + e.stack);
    }
}

processScheduleData();