import * as cdk from 'aws-cdk-lib';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import {Construct} from 'constructs';

export class EventResourceStack extends cdk.Stack {

    readonly listFunction: cdk.aws_lambda.Function;
    readonly saveFunction: cdk.aws_lambda.Function;
    readonly deleteFunction: cdk.aws_lambda.Function;

    constructor(scope: Construct, id: string, props: cdk.StackProps) {
        super(scope, id, props);

        const table = new ddb.Table(this, 'EventTable', {
            partitionKey: {name: 'id', type: ddb.AttributeType.STRING}
        });
        table.addGlobalSecondaryIndex({
            indexName: 'GlobalSortByEventDateIndex',
            partitionKey: {name: 'index', type: ddb.AttributeType.STRING},
            sortKey: {name: 'eventDate', type: ddb.AttributeType.STRING}
        });

        this.listFunction = new lambda.Function(this, 'ListEvents', {
            description: 'Retrieves the list of OLAC events from the datastore',
            runtime: lambda.Runtime.NODEJS_16_X,
            code: lambda.Code.fromAsset('./lambda/resource/event'),
            handler: 'get-events.handler',
            environment: {
                TABLE_NAME: table.tableName
            },
        });
        table.grantReadData(this.listFunction);

        this.saveFunction = new lambda.Function(this, 'SaveEvent', {
            description: 'Saves OLAC event information to the datastore',
            runtime: lambda.Runtime.NODEJS_16_X,
            code: lambda.Code.fromAsset('./lambda/resource/event'),
            handler: 'save.handler',
            environment: {
                TABLE_NAME: table.tableName
            },
        });
        table.grantReadWriteData(this.saveFunction);

        this.deleteFunction = new lambda.Function(this, 'DeleteEvent', {
            description: 'Deletes OLAC event information from the datastore',
            runtime: lambda.Runtime.NODEJS_16_X,
            code: lambda.Code.fromAsset('./lambda/resource/event'),
            handler: 'delete.handler',
            environment: {
                TABLE_NAME: table.tableName
            },
        });
        table.grantReadWriteData(this.deleteFunction);
    }
}