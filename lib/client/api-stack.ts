import * as cdk from 'aws-cdk-lib';
import {Duration} from 'aws-cdk-lib';
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import {JsonSchemaType, LambdaIntegration, MethodOptions} from "aws-cdk-lib/aws-apigateway";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import {Function} from 'aws-cdk-lib/aws-lambda';
import {Construct} from 'constructs';
import * as logs from "aws-cdk-lib/aws-logs";

interface ApiStackProps extends cdk.StackProps {
    echoFunction: Function,
    getClientConfigFunction: Function,
    newReservationIdFunction: Function,
    whoAmIFunction: Function,

    eventListFunction: Function,
    eventSaveFunction: Function,
    eventDeleteFunction: Function,

    reservationListFunction: Function,
    reservationSaveFunction: Function,
    reservationDeleteFunction: Function,

    grantGroupMap: {
        admin: Array<cognito.CfnUserPoolGroup>,
        eventCoordinator: Array<cognito.CfnUserPoolGroup>
    }
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
            restApiName: "OLAC API",
            description: "API for the OLAC website back end functions",
            cloudWatchRole: true,
            deployOptions: {
                accessLogDestination: new apigateway.LogGroupLogDestination(prdLogGroup),
                accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields(),
                loggingLevel: apigateway.MethodLoggingLevel.ERROR,
                dataTraceEnabled: false
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
                            REQUIRED_GROUPS: props.grantGroupMap.eventCoordinator.map(g => g.groupName).join(" ")
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
                            REQUIRED_GROUPS: props.grantGroupMap.admin.map(g => g.groupName).join(" ")
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
        const echoIntegration = new LambdaIntegration(props.echoFunction, {
            requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        });

        const publicApi = api.addResource("public");
        const publicClientConfig = publicApi.addResource("client-config");
        publicClientConfig.addMethod("GET", new LambdaIntegration(props.getClientConfigFunction, {
            requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        }));
        const publicTicketTypes = publicApi.addResource("ticket-types");
        publicTicketTypes.addMethod("GET", echoIntegration);
        const publicNewReservationIdConfig = publicApi.addResource("new-reservation-id");
        publicNewReservationIdConfig.addMethod("GET", new LambdaIntegration(props.newReservationIdFunction, {
            requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        }));
        const publicReservations = publicApi.addResource("reservations");
        publicReservations.addMethod("POST", echoIntegration);
        const publicReservationsAvailable = publicReservations.addResource("_available");
        publicReservationsAvailable.addMethod("GET", echoIntegration);

        const event = api.addResource("event");
        const eventReservationsCsv = event.addResource("reservations.csv");
        eventReservationsCsv.addMethod("GET", echoIntegration, authorizers.eventCoordinator);

        const admin = api.addResource("admin");
        const adminReservations = admin.addResource("reservations");
        const adminReservationsID = adminReservations.addResource("{reservationId}");
        const adminReservationsIDAudit = adminReservationsID.addResource("audit");
        adminReservationsIDAudit.addMethod("GET", echoIntegration, authorizers.admin);

        const auth = api.addResource("auth");
        const whoAmI = auth.addResource("who-am-i");
        whoAmI.addMethod("GET", new LambdaIntegration(props.whoAmIFunction, {
            requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        }));
    }

    apiVersion2(props: ApiStackProps, api: apigateway.Resource, authorizers: Authorizers) {
        const events = api.addResource("events");
        events.addMethod("GET", new LambdaIntegration(props.eventListFunction, {
            requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        }), authorizers.eventCoordinator);
        events.addMethod("POST", new LambdaIntegration(props.eventSaveFunction, {
            requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        }), authorizers.admin);

        const eventsEventId = events.addResource("{eventId}");
        eventsEventId.addMethod("PUT", new LambdaIntegration(props.eventSaveFunction, {
            requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        }), authorizers.admin);
        eventsEventId.addMethod("DELETE", new LambdaIntegration(props.eventDeleteFunction, {
            requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        }), authorizers.admin);

        const eventsEventIdReservations = eventsEventId.addResource("reservations");
        eventsEventIdReservations.addMethod("GET", new LambdaIntegration(props.reservationListFunction, {
            requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        }), authorizers.eventCoordinator);
        eventsEventIdReservations.addMethod("POST", new LambdaIntegration(props.reservationSaveFunction, {
            requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        }), authorizers.eventCoordinator);

        const eventsEventIdReservationsReservationId = eventsEventIdReservations.addResource("{reservationId}");
        eventsEventIdReservationsReservationId.addMethod("PUT", new LambdaIntegration(props.reservationSaveFunction, {
            requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        }), authorizers.eventCoordinator);
        eventsEventIdReservationsReservationId.addMethod("DELETE", new LambdaIntegration(props.reservationDeleteFunction, {
            requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        }), authorizers.eventCoordinator);
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

