import * as cdk from 'aws-cdk-lib';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import {Construct} from 'constructs';

export class EventResourceStack extends cdk.Stack {

    listEventsFunction: cdk.aws_lambda.Function;
    saveEventFunction: cdk.aws_lambda.Function;
    deleteEventFunction: cdk.aws_lambda.Function;

    listReservationsFunction: cdk.aws_lambda.Function;
    saveReservationFunction: cdk.aws_lambda.Function;
    deleteReservationFunction: cdk.aws_lambda.Function;

    constructor(scope: Construct, id: string, props: cdk.StackProps) {
        super(scope, id, props);
        this.defineEventFunctions();
        this.defineReservationFunctions();
    }

    private defineEventFunctions() {
        const table = new ddb.Table(this, 'EventTable', {
            partitionKey: {name: 'id', type: ddb.AttributeType.STRING}
        });
        table.addGlobalSecondaryIndex({
            indexName: 'GlobalSortByEventDateIndex',
            partitionKey: {name: 'index', type: ddb.AttributeType.STRING},
            sortKey: {name: 'eventDate', type: ddb.AttributeType.STRING}
        });

        this.listEventsFunction = new lambda.Function(this, 'ListEvents', {
            description: 'Retrieves the list of OLAC events from the datastore',
            runtime: lambda.Runtime.NODEJS_16_X,
            code: lambda.Code.fromAsset('./lambda/resource/event'),
            handler: 'get-events.handler',
            environment: {
                TABLE_NAME: table.tableName
            },
        });
        table.grantReadData(this.listEventsFunction);

        this.saveEventFunction = new lambda.Function(this, 'SaveEvent', {
            description: 'Saves OLAC event information to the datastore',
            runtime: lambda.Runtime.NODEJS_16_X,
            code: lambda.Code.fromAsset('./lambda/resource/event'),
            handler: 'save-event.handler',
            environment: {
                TABLE_NAME: table.tableName
            },
        });
        table.grantReadWriteData(this.saveEventFunction);

        this.deleteEventFunction = new lambda.Function(this, 'DeleteEvent', {
            description: 'Deletes OLAC event information from the datastore',
            runtime: lambda.Runtime.NODEJS_16_X,
            code: lambda.Code.fromAsset('./lambda/resource/event'),
            handler: 'delete-event.handler',
            environment: {
                TABLE_NAME: table.tableName
            },
        });
        table.grantReadWriteData(this.deleteEventFunction);
    }

    private defineReservationFunctions() {
        const table = new ddb.Table(this, 'ReservationTable', {
            partitionKey: {name: 'id', type: ddb.AttributeType.STRING}
        });
        table.addGlobalSecondaryIndex({
            indexName: 'GlobalEventIndex',
            partitionKey: {name: 'eventId', type: ddb.AttributeType.STRING},
            sortKey: {name: 'reservationId', type: ddb.AttributeType.NUMBER}
        });

        this.listReservationsFunction = new lambda.Function(this, 'ListEventReservations', {
            description: 'Retrieves the list of OLAC event reservations from the datastore',
            runtime: lambda.Runtime.NODEJS_16_X,
            code: lambda.Code.fromAsset('./lambda/resource/event'),
            handler: 'get-event-reservations.handler',
            environment: {
                TABLE_NAME: table.tableName
            },
        });
        table.grantReadData(this.listReservationsFunction);

        this.saveReservationFunction = new lambda.Function(this, 'SaveEventReservation', {
            description: 'Saves OLAC event reservation information to the datastore',
            runtime: lambda.Runtime.NODEJS_16_X,
            code: lambda.Code.fromAsset('./lambda/resource/event'),
            handler: 'save-reservation.handler',
            environment: {
                TABLE_NAME: table.tableName
            },
        });
        table.grantReadWriteData(this.saveReservationFunction);

        this.deleteReservationFunction = new lambda.Function(this, 'DeleteReservation', {
            description: 'Deletes an OLAC event reservation from the datastore',
            runtime: lambda.Runtime.NODEJS_16_X,
            code: lambda.Code.fromAsset('./lambda/resource/event'),
            handler: 'delete-reservation.handler',
            environment: {
                TABLE_NAME: table.tableName
            },
        });
        table.grantReadWriteData(this.deleteReservationFunction);
    }
}