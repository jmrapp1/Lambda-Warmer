import * as AWS from 'aws-sdk';
import { InvokeAsyncResponse } from 'aws-sdk/clients/lambda';

const lambda = new AWS.Lambda({
    apiVersion: '2015-03-31'
});

const defaultInvokeData = {
    warmer: true
};

exports.handler = async (events: []) => {
    console.log(`Warming ${events.length} lambdas.`);
    await Promise.all(events.map(warmLambda));
    console.log('Finished warming all lambdas.');
};

async function warmLambda(lambdaConfig: { lambda: string, concurrency: number, invokeArgs?}) {
    const promises = [];
    console.log(`Invoking '${lambdaConfig.lambda}' ${lambdaConfig.concurrency} times with ${lambdaConfig.invokeArgs ? 'custom' : 'default'} invoke arguments`);
    for (let i = 0; i < lambdaConfig.concurrency; i++) {
        promises.push(invokeLambda(lambdaConfig.lambda, lambdaConfig.invokeArgs));
    }
    await Promise.all(promises);
    console.log(`Finished invoking ${lambdaConfig.concurrency} '${lambdaConfig.lambda}' lambdas`);
}

function invokeLambda(lambdaFunction: string, invokeArgs): Promise<InvokeAsyncResponse> {
    return new Promise((resolve, reject) => {
        lambda.invokeAsync(
            { FunctionName: lambdaFunction, InvokeArgs: invokeArgs || JSON.stringify( defaultInvokeData) },
            (err, data) => err ? reject(err) : resolve(data));
    })
}