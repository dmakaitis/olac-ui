import * as cdk from 'aws-cdk-lib';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import {BillingMode} from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import {Construct} from 'constructs';

export class EventResourceStack extends cdk.Stack {

    listEventsFunction: cdk.aws_lambda.Function;
    saveEventFunction: cdk.aws_lambda.Function;
    deleteEventFunction: cdk.aws_lambda.Function;

    listReservationsFunction: cdk.aws_lambda.Function;
    listReservationsCsvFunction: cdk.aws_lambda.Function;
    saveReservationFunction: cdk.aws_lambda.Function;
    deleteReservationFunction: cdk.aws_lambda.Function;

    areTicketsAvailableFunction: cdk.aws_lambda.Function;

    eventsTable: cdk.aws_dynamodb.Table;
    auditTable: cdk.aws_dynamodb.Table;

    constructor(scope: Construct, id: string, props: cdk.StackProps) {
        super(scope, id, props);
        this.defineEventFunctions();
        this.defineReservationFunctions();
    }

    private defineEventFunctions() {
        const table = new ddb.Table(this, 'EventTable', {
            partitionKey: {name: 'id', type: ddb.AttributeType.STRING},
            billingMode: BillingMode.PAY_PER_REQUEST
        });
        table.addGlobalSecondaryIndex({
            indexName: 'GlobalSortByEventDateIndex',
            partitionKey: {name: 'index', type: ddb.AttributeType.STRING},
            sortKey: {name: 'eventDate', type: ddb.AttributeType.STRING}
        });
        this.eventsTable = table;

        this.listEventsFunction = new lambda.Function(this, 'ListEvents', {
            description: 'Retrieves the list of OLAC events from the datastore',
            runtime: lambda.Runtime.NODEJS_22_X,
            code: lambda.Code.fromAsset('./lambda/resource/event'),
            handler: 'get-events.handler',
            environment: {
                TABLE_NAME: table.tableName
            },
        });
        table.grantReadData(this.listEventsFunction);

        this.saveEventFunction = new lambda.Function(this, 'SaveEvent', {
            description: 'Saves OLAC event information to the datastore',
            runtime: lambda.Runtime.NODEJS_22_X,
            code: lambda.Code.fromAsset('./lambda/resource/event'),
            handler: 'save-event.handler',
            environment: {
                TABLE_NAME: table.tableName
            },
        });
        table.grantReadWriteData(this.saveEventFunction);

        this.deleteEventFunction = new lambda.Function(this, 'DeleteEvent', {
            description: 'Deletes OLAC event information from the datastore',
            runtime: lambda.Runtime.NODEJS_22_X,
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
            partitionKey: {name: 'id', type: ddb.AttributeType.STRING},
            billingMode: BillingMode.PAY_PER_REQUEST
        });
        table.addGlobalSecondaryIndex({
            indexName: 'GlobalEventIndex',
            partitionKey: {name: 'eventId', type: ddb.AttributeType.STRING},
            sortKey: {name: 'reservationId', type: ddb.AttributeType.NUMBER}
        });

        this.auditTable = new ddb.Table(this, 'ReservationAuditTable', {
            partitionKey: {name: 'id', type: ddb.AttributeType.STRING},
            billingMode: BillingMode.PAY_PER_REQUEST
        });
        this.auditTable.addGlobalSecondaryIndex({
            indexName: 'GlobalReservationIndex',
            partitionKey: {name: 'reservationId', type: ddb.AttributeType.STRING},
            sortKey: {name: 'timestamp', type: ddb.AttributeType.STRING}
        });

        const counterTable = new ddb.Table(this, 'ReservationCounterTable', {
            partitionKey: {name: 'id', type: ddb.AttributeType.STRING},
            billingMode: BillingMode.PAY_PER_REQUEST
        });

        this.listReservationsFunction = new lambda.Function(this, 'ListEventReservations', {
            description: 'Retrieves the list of OLAC event reservations from the datastore',
            runtime: lambda.Runtime.NODEJS_22_X,
            code: lambda.Code.fromAsset('./lambda/resource/event'),
            handler: 'get-event-reservations.handler',
            environment: {
                TABLE_NAME: table.tableName
            },
        });
        table.grantReadData(this.listReservationsFunction);

        this.listReservationsCsvFunction = new lambda.Function(this, 'ListEventReservationsCsv', {
            description: 'Retrieves the list of OLAC event reservations from the datastore in CSV format',
            runtime: lambda.Runtime.NODEJS_22_X,
            code: lambda.Code.fromAsset('./lambda/resource/event'),
            handler: 'get-event-reservations-csv.handler',
            environment: {
                TABLE_NAME: table.tableName
            },
        });
        table.grantReadData(this.listReservationsCsvFunction);

        this.saveReservationFunction = new lambda.Function(this, 'SaveEventReservation', {
            description: 'Saves OLAC event reservation information to the datastore',
            runtime: lambda.Runtime.NODEJS_22_X,
            code: lambda.Code.fromAsset('./lambda/resource/event'),
            handler: 'save-reservation.handler',
            environment: {
                TABLE_NAME: table.tableName,
                COUNTER_TABLE_NAME: counterTable.tableName,
                AUDIT_TABLE_NAME: this.auditTable.tableName
            },
        });
        table.grantReadWriteData(this.saveReservationFunction);
        counterTable.grantReadWriteData(this.saveReservationFunction);
        this.auditTable.grantWriteData(this.saveReservationFunction);

        this.deleteReservationFunction = new lambda.Function(this, 'DeleteReservation', {
            description: 'Deletes an OLAC event reservation from the datastore',
            runtime: lambda.Runtime.NODEJS_22_X,
            code: lambda.Code.fromAsset('./lambda/resource/event'),
            handler: 'delete-reservation.handler',
            environment: {
                TABLE_NAME: table.tableName
            },
        });
        table.grantReadWriteData(this.deleteReservationFunction);

        this.areTicketsAvailableFunction = new lambda.Function(this, 'AreTicketsAvailable', {
            description: 'Checks to see if the requested number of tickets are available for an event',
            runtime: lambda.Runtime.NODEJS_22_X,
            code: lambda.Code.fromAsset('./lambda/resource/event'),
            handler: 'are-tickets-available.apiHandler',
            environment: {
                EVENT_TABLE_NAME: this.eventsTable.tableName,
                RESERVATION_TABLE_NAME: table.tableName
            }
        });
        this.eventsTable.grantReadData(this.areTicketsAvailableFunction);
        table.grantReadData(this.areTicketsAvailableFunction);
    }
}