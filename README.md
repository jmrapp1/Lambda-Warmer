# Patient-ES-Adapter

Lambda to push patient data to ES

## Requirements

* AWS CLI, authenticated with [accolade-okta](https://github.com/konciergeMD/aws-okta-authenticator)
* [Docker installed](https://www.docker.com/community-edition)
* [SAM Local installed](https://github.com/awslabs/aws-sam-local)

Provided that you have requirements above installed, proceed by installing the application dependencies and development dependencies:

```bash
npm install
```

## Local development

Run the lambda function using sample data:
`npm run local`

Example local invocation with s3 event and debugger listening on port 4444:

```bash
sam local generate-event s3 | sam local invoke Function -d 4444 --profile sandbox --env-vars env_vars.json
```

### Debugging

[aws-sam-cli#debugging-applications](https://github.com/awslabs/aws-sam-cli#debugging-applications)

## Deploy stack to sandbox 

```bash
npm run full-deploy
```

## Deployment

For deploying your local build to `sandbox` account, use AWS CLI commands bellow. `test`, and `prod` can be only deployed to with shippable.

## Approvals

You must have [Tropopause](https://github.com/konciergeMD/tropopause) installed locally in order to run the following commands.

- **Test3**: `npm run approve-test3 <changeSetId>`
- **Test1**: `npm run approve-test1 <changeSetId>`
- **Staging**: `npm run approve-staging <changeSetId>` 
- **Prod**: Toga must approve the changes for production. Leave a message in `#devops-pull-requests` with the stack  and change set name. Once approved they will send you a URL to execute the changes.

### AWS CLI commands

AWS CLI commands to package, deploy and describe outputs defined within the cloudformation stack:

```bash
aws cloudformation package \
    --template-file template.yaml \
    --output-template-file packaged.yaml \
    --s3-bucket REPLACE_THIS_WITH_YOUR_S3_BUCKET_NAME

aws cloudformation deploy \
    --template-file packaged.yaml \
    --stack-name patient-es-adapter \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides MyParameterSample=MySampleValue

aws cloudformation describe-stacks \
    --stack-name patient-es-adapter --query 'Stacks[].Outputs'
```


