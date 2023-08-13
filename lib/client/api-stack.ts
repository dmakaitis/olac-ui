import * as cdk from 'aws-cdk-lib';
import {Duration} from 'aws-cdk-lib';
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import {AwsIntegration, Cors, JsonSchemaType, LambdaIntegration, MethodOptions} from "aws-cdk-lib/aws-apigateway";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import {Function} from 'aws-cdk-lib/aws-lambda';
import {Table} from 'aws-cdk-lib/aws-dynamodb';
import {Construct} from 'constructs';
import * as logs from "aws-cdk-lib/aws-logs";
import {Effect, Policy, PolicyStatement, Role} from "aws-cdk-lib/aws-iam";

interface ApiStackProps extends cdk.StackProps {
    apiRoleARN: string,

    getClientConfigFunction: Function,
    newReservationIdFunction: Function,
    whoAmIFunction: Function,

    eventListFunction: Function,
    eventSaveFunction: Function,
    eventDeleteFunction: Function,

    eventsTable: Table,
    auditTable: Table,

    reservationListFunction: Function,
    reservationListCsvFunction: Function,
    reservationSaveFunction: Function,
    reservationDeleteFunction: Function,

    postNewReservationFunction: Function,

    areTicketsAvailableFunction: Function;

    grantGroupMap: {
        admin: cognito.CfnUserPoolGroup,
        eventCoordinator: cognito.CfnUserPoolGroup
    };

    cognitoUserPoolId: string;
    cognitoClientId: string;
}

interface Authorizers {
    eventCoordinator: MethodOptions,
    admin: MethodOptions
}

interface ModelDefinitions {
    event: apigateway.Model
}

export class ApiStack extends cdk.Stack {

    readonly restApi: apigateway.RestApi;

    constructor(scope: Construct, id: string, props: ApiStackProps) {
        super(scope, id, props);

        const prdLogGroup = new logs.LogGroup(this, "PrdLogs");

        this.restApi = new apigateway.RestApi(this, "OlacApi", {
            restApiName: this.stackName,
            description: "API for the OLAC website back end functions",
            cloudWatchRole: true,
            deployOptions: {
                accessLogDestination: new apigateway.LogGroupLogDestination(prdLogGroup),
                accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields(),
                loggingLevel: apigateway.MethodLoggingLevel.ERROR,
                dataTraceEnabled: false
            },
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS
            }
        });

        const api = this.restApi.root.addResource("api");

        const models = this.defineModels();

        const authorizers: Authorizers = {
            eventCoordinator: {
                authorizationType: apigateway.AuthorizationType.CUSTOM,
                authorizer: new apigateway.RequestAuthorizer(this, 'EventCoordinatorAuthorizer', {
                    handler: new lambda.Function(this, 'EventCoordinatorAuthorizerFunction', {
                        description: 'API Gateway Event Coordinator Authorizer',
                        runtime: lambda.Runtime.NODEJS_16_X,
                        code: lambda.Code.fromAsset('./lambda/utility/security'),
                        handler: 'authorize.handler',
                        environment: {
                            USER_POOL_ID: props.cognitoUserPoolId,
                            CLIENT_ID: props.cognitoClientId,
                            ADMIN_GROUP_NAME: `${props.grantGroupMap.admin.groupName}`,
                            EVENT_COORDINATOR_GROUP_NAME:  `${props.grantGroupMap.eventCoordinator.groupName}`,
                            REQUIRED_GROUPS: `${props.grantGroupMap.eventCoordinator.groupName} ${props.grantGroupMap.admin.groupName}`
                        }
                    }),
                    identitySources: [
                        apigateway.IdentitySource.header('Authorization')
                    ],
                    resultsCacheTtl: Duration.minutes(0)
                })
            },
            admin: {
                authorizationType: apigateway.AuthorizationType.CUSTOM,
                authorizer: new apigateway.RequestAuthorizer(this, 'AdminAuthorizer', {
                    handler: new lambda.Function(this, 'AdminAuthorizerFunction', {
                        description: 'API Gateway Admin Authorizer',
                        runtime: lambda.Runtime.NODEJS_16_X,
                        code: lambda.Code.fromAsset('./lambda/utility/security'),
                        handler: 'authorize.handler',
                        environment: {
                            USER_POOL_ID: props.cognitoUserPoolId,
                            CLIENT_ID: props.cognitoClientId,
                            ADMIN_GROUP_NAME: `${props.grantGroupMap.admin.groupName}`,
                            EVENT_COORDINATOR_GROUP_NAME:  `${props.grantGroupMap.eventCoordinator.groupName}`,
                            REQUIRED_GROUPS: `${props.grantGroupMap.admin.groupName}`
                        }
                    }),
                    identitySources: [
                        apigateway.IdentitySource.header('Authorization')
                    ],
                    resultsCacheTtl: Duration.minutes(0)
                })
            }
        }

        this.apiVersion1(props, api, authorizers);
        this.apiVersion2(props, api, authorizers);
    }

    /*****************************
     * Define version 1 of the API (legacy).
     *
     * @param props
     * @param api
     * @param authorizers
     */
    apiVersion1(props: ApiStackProps, api: apigateway.Resource, authorizers: Authorizers) {
        // TODO: Replace this with a generated document stored in S3:
        const publicApi = api.addResource("public");
        const publicClientConfig = publicApi.addResource("client-config");
        publicClientConfig.addMethod("GET", new LambdaIntegration(props.getClientConfigFunction, {
            requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        }));
    }

    /*****************************
     * Define version 2 of the API (current).
     *
     * @param props
     * @param api
     * @param authorizers
     */
    apiVersion2(props: ApiStackProps, api: apigateway.Resource, authorizers: Authorizers) {
        const apiRole = Role.fromRoleArn(this, 'ApiRole', props.apiRoleARN);
        apiRole.attachInlinePolicy(new Policy(this, 'ApiEventsPolicy', {
            statements: [
                new PolicyStatement({
                    actions: [
                        'dynamodb:GetItem',
                    ],
                    effect: Effect.ALLOW,
                    resources: [
                        props.eventsTable.tableArn,
                    ]
                }),
                new PolicyStatement({
                    actions: [
                        'dynamodb:Query'
                    ],
                    effect: Effect.ALLOW,
                    resources: [
                        props.auditTable.tableArn,
                        `${props.auditTable.tableArn}/index/*`
                    ]
                }),
            ]
        }));

        const errorResponses = [
            {
                selectionPattern: '400',
                statusCode: '400',
                responseTemplates: {
                    "application/json": `{
                        "error": "Bad input!"
                    }`,
                },
            },
            {
                selectionPattern: '5\\d{2}',
                statusCode: '500',
                responseTemplates: {
                    'application/json': `{
                        "error": "Internal Service Error!"
                    }`,
                },
            },
        ];


        const events = api.addResource("events");
        events.addMethod("GET", new LambdaIntegration(props.eventListFunction, {
            requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        }), authorizers.eventCoordinator);
        events.addMethod("POST", new LambdaIntegration(props.eventSaveFunction, {
            requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        }), authorizers.admin);

        const eventsEventId = events.addResource("{eventId}");
        eventsEventId.addMethod("GET", new AwsIntegration({
            service: "dynamodb",
            action: "GetItem",
            options: {
                credentialsRole: apiRole,
                requestTemplates: {
                    "application/json": `{
                        "TableName": "${props.eventsTable.tableName}",
                        "Key": {
                            "id": {
                                "S": "$method.request.path.eventId"
                            }
                        }
                    }`
                },
                integrationResponses: [
                    {
                        statusCode: '200',
                        responseTemplates: {
                            "application/json": `
                                #set($inputRoot = $input.path('$'))
                                {
                                    "id": "$inputRoot.Item.id.S",
                                    "name": "$inputRoot.Item.name.S",
                                    "eventDate": "$inputRoot.Item.eventDate.S",
                                    #if($inputRoot.Item.ticketSaleStartDate.S != "") "ticketSaleStartDate": "$inputRoot.Item.ticketSaleStartDate.S",#end
                                    #if($inputRoot.Item.ticketSaleEndDate.S != "") "ticketSaleEndDate": "$inputRoot.Item.ticketSaleEndDate.S",#end
                                    #if($inputRoot.Item.maxTickets.N != "") "maxTickets": $inputRoot.Item.maxTickets.N,#end
                                    "ticketTypes": [
                                        #foreach($ticketType in $inputRoot.Item.ticketTypes.L)
                                            {
                                                "name": "$ticketType.M.name.S",
                                                "price": $ticketType.M.price.N
                                            }#if($foreach.hasNext),#end
                                        #end
                                    ]
                                }`
                        }
                    },
                    ...errorResponses
                ]
            }
        }), {
            methodResponses: [{statusCode: '200'}, {statusCode: '400'}, {statusCode: '500'}]
        });
        eventsEventId.addMethod("PUT", new LambdaIntegration(props.eventSaveFunction, {
            requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        }), authorizers.admin);
        eventsEventId.addMethod("DELETE", new LambdaIntegration(props.eventDeleteFunction, {
            requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        }), authorizers.admin);

        const eventsEventIdAvailable = eventsEventId.addResource("_available");
        eventsEventIdAvailable.addMethod("GET", new LambdaIntegration(props.areTicketsAvailableFunction, {
            requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        }));

        const eventsEventIdNewReservation = eventsEventId.addResource("_newReservation");
        eventsEventIdNewReservation.addMethod("POST", new LambdaIntegration(props.postNewReservationFunction, {
            requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        }));

        const eventsEventIdReservationsCsv = eventsEventId.addResource("reservations.csv");
        eventsEventIdReservationsCsv.addMethod("GET", new LambdaIntegration(props.reservationListCsvFunction, {
            requestTemplates: {"text/csv": '{ "statusCode": "200" }'}
        }), authorizers.eventCoordinator);

        const eventsEventIdReservations = eventsEventId.addResource("reservations");
        eventsEventIdReservations.addMethod("GET", new LambdaIntegration(props.reservationListFunction, {
            requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        }), authorizers.eventCoordinator);
        eventsEventIdReservations.addMethod("POST", new LambdaIntegration(props.reservationSaveFunction, {
            requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        }), authorizers.eventCoordinator);

        const eventsEventIdReservationsNewId = eventsEventIdReservations.addResource("_new-id");
        eventsEventIdReservationsNewId.addMethod("GET", new LambdaIntegration(props.newReservationIdFunction, {
            requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        }));

        const eventsEventIdReservationsReservationId = eventsEventIdReservations.addResource("{reservationId}");
        eventsEventIdReservationsReservationId.addMethod("PUT", new LambdaIntegration(props.reservationSaveFunction, {
            requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        }), authorizers.eventCoordinator);
        eventsEventIdReservationsReservationId.addMethod("DELETE", new LambdaIntegration(props.reservationDeleteFunction, {
            requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        }), authorizers.eventCoordinator);

        const eventsEventIdReservationsReservationIdAudit = eventsEventIdReservationsReservationId.addResource("audit");
        eventsEventIdReservationsReservationIdAudit.addMethod("GET", new AwsIntegration({
            service: "dynamodb",
            action: "Query",
            options: {
                credentialsRole: apiRole,
                requestTemplates: {
                    "application/json": `{
                        "TableName": "${props.auditTable.tableName}",
                        "IndexName": "GlobalReservationIndex",
                        "ScanIndexForward": false,
                        "KeyConditionExpression": "reservationId = :resId",
                        "ExpressionAttributeValues": {
                            ":resId": {
                                "S": "$method.request.path.reservationId"
                            }
                        }
                    }`
                },
                integrationResponses: [
                    {
                        statusCode: '200',
                        responseTemplates: {
                            "application/json": `
                                #set($inputRoot = $input.path('$'))
                                {
                                    "items": [
                                        #foreach($item in $inputRoot.Items)
                                        {
                                            "timestamp": "$item.timestamp.S",
                                            "user": "$item.user.S",
                                            "note": "$item.note.S.replace('\\', '\\\\').replace('"', '\\"')"
                                        }#if($foreach.hasNext),#end
                                        #end
                                    ]
                                }
                            `
                        }
                    },
                    ...errorResponses
                ]
            }
        }), {
            methodResponses: [{statusCode: '200'}, {statusCode: '400'}, {statusCode: '500'}],
            authorizationType: authorizers.admin.authorizationType,
            authorizer: authorizers.admin.authorizer,
        });

        const auth = api.addResource("auth");
        const whoAmI = auth.addResource("who-am-i");
        whoAmI.addMethod("GET", new LambdaIntegration(props.whoAmIFunction, {
            requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        }));
    }

    /**
     * Define models used within the API.
     */
    defineModels(): ModelDefinitions {
        const event = this.restApi.addModel('Event', {
            contentType: 'application/json',
            modelName: 'Event',
            schema: {
                schema: apigateway.JsonSchemaVersion.DRAFT7,
                title: 'event',
                type: JsonSchemaType.OBJECT,
                required: ['id', 'name'],
                properties: {
                    id: {
                        type: JsonSchemaType.STRING,
                        description: 'The unique identifier for this event.'
                    },
                    name: {
                        type: JsonSchemaType.STRING,
                        description: 'The name of the event'
                    },
                    eventDate: {
                        type: JsonSchemaType.STRING,
                        description: 'The date on which the event takes place.'
                    },
                    ticketSaleStartDate: {
                        type: JsonSchemaType.STRING,
                        description: 'The fist date on which tickets for this event should go on sale, or blank if they should immediately go on sale.'
                    },
                    ticketSaleEndDate: {
                        type: JsonSchemaType.STRING,
                        description: 'The last date for which tickets for this event should be sold, or blank if they should be sold up to the date of the event.'
                    },
                    maxTickets: {
                        type: JsonSchemaType.INTEGER,
                        description: 'The maximum number of tickets to sell for this event, or blank for unlimited tickets.',
                        minimum: 1
                    },
                    ticketTypes: {
                        type: JsonSchemaType.ARRAY,
                        description: 'The types of tickets available and their associated prices.',
                        items: {
                            type: JsonSchemaType.OBJECT,
                            required: ['name', 'price'],
                            properties: {
                                name: {
                                    type: JsonSchemaType.STRING,
                                    description: 'The name of the ticket type'
                                },
                                price: {
                                    type: JsonSchemaType.NUMBER,
                                    description: 'The price for each ticket',
                                    minimum: 0
                                }
                            }
                        }
                    },
                }
            }
        });

        const getEventsResponse = this.restApi.addModel('GetEventsResponse', {
            contentType: 'application/json',
            modelName: 'GetEventsResponse',
            schema: {
                schema: apigateway.JsonSchemaVersion.DRAFT7,
                title: 'get-events-response',
                type: JsonSchemaType.OBJECT,
                required: ['items'],
                properties: {
                    items: {
                        type: JsonSchemaType.ARRAY,
                        items: {}
                    },
                    nextStartKey: {
                        type: JsonSchemaType.STRING,

                    }
                }
            }
        });

        return {
            event
        }
    }

}

