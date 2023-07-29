import * as cdk from 'aws-cdk-lib';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import {Construct} from 'constructs';

export class EventResourceStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: cdk.StackProps) {
        super(scope, id, props);

        const table = new ddb.Table(this, 'EventTable', {
            partitionKey: {name: 'id', type: ddb.AttributeType.STRING}
        });

        const saveLambda = new lambda.Function(this, 'SaveEvent', {
            description: 'Saves OLAC event information to the datastore',
            runtime: lambda.Runtime.NODEJS_16_X,
            code: lambda.Code.fromAsset('./lambda/resource/event'),
            handler: 'save.handler',
            environment: {
                TABLE_NAME: table.tableName
            },
        });

        table.grantReadWriteData(saveLambda);
    }
}