# Lambda Warmer

## Setup
### Install Dependencies

- The Lambda gets packaged and deployed using [AWS SAM](https://aws.amazon.com/serverless/sam/). 
Make sure to install the most recent version.
- Install packages: `npm i`

### Environmental Properties:
Create `.env` file with the following properties
```
SAM_S3_BUCKET = <bucket to hold SAM output>
AWS_REGION = <AWS region>
CF_STACK_NAME = <CloudFormation stack name>
AWS_PROFILE = <Optional: AWS credential profile>
WARMING_RATE = <Optional: Rate (in minutes) to warm functions; Default=5 
```

### Warming Schedule Configuration:

You can fully configure which lambdas you'd like to keep warm by 
creating a warming configuration file. Start by creating a file called `warming_config.json`. The configurations
are defined in the following format:
```
[
    {
        "lambda": "<Lambda ARN or Name>",
        "concurrency": <Number>,
        "invokeArgs": <JSON Data>
    },
    { ... },
    { ... }
]
```

The following is an example of a configuration that warms two lambda functions.
The first lambda is configured to keep 5 instances warm. The second
lambda is configured to keep 3 instances warm, and also passes custom
JSON data to the lambda when invoked:
```
[
  {
    "lambda": "arn:aws:lambda:us-east-1:1111111111:function:my-lambda-function",
    "concurrency": 5
  },
  {
    "lambda": "arn:aws:lambda:us-east-1:1111111111:function:my-other-lambda-function",
    "concurrency": 3,
    "invokeArgs": {
      "data": "This is some custom warming data to pass to our lambda",
      "extra": {
        "info": "It supports any valid JSON"
      }
    }
  }
]
```

## Deployment

Deployment is easy. Run `npm run deploy` to create/update a CloudFront 
stack for the warming lambda. This automatically creates and starts the warming
schedule

## Handling Warming Calls From The Invoked Lambdas Side

When a Lambda is warmed, you usually don't want to run any of the function's logic.
Doing so would be a waste of execution time, memory, and other resources. In order
to handle this you can add catches to the beginning of your lambdas to look for
invocations originating from the warmer.

In the warming configuration file you may have noticed that there is an
optional `invokeArgs` property. Whatever JSON data you provide to this
property will get passed to the lambda in it's `event` parameter.

If you did not specify a value for the `invokeArgs` property, then it will
be set to `{ "warmer": true }`. This then gets passed to the lambda's `event`
parameter. 
 
Here is an example of how you'd handle this in a Node Lambda Function:
```
exports.handler = (event, context, callback) => {
    if (event.warmer) {
        return callback();
    }
    ...
    <Core Function Logic>
}
``` 

