import * as cdk from 'aws-cdk-lib';
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import {MethodOptions} from "aws-cdk-lib/aws-apigateway";
import * as cognito from "aws-cdk-lib/aws-cognito";
import {Function} from 'aws-cdk-lib/aws-lambda';
import {Construct} from 'constructs';
import * as lambda from "aws-cdk-lib/aws-lambda";

interface ApiStackProps extends cdk.StackProps {
    echoFunction: Function,
    getClientConfigFunction: Function,
    newReservationIdFunction: Function,
    whoAmIFunction: Function,

    eventListFunction: Function,
    eventSaveFunction: Function,

    grantGroupMap: {
        admin: Array<cognito.CfnUserPoolGroup>,
        eventCoordinator: Array<cognito.CfnUserPoolGroup>
    }
}

interface Authorizers {
    eventCoordinator: MethodOptions,
    admin: MethodOptions
}

export class ApiStack extends cdk.Stack {

    readonly restApi: apigateway.RestApi;

    constructor(scope: Construct, id: string, props: ApiStackProps) {
        super(scope, id, props);

        this.restApi = new apigateway.RestApi(this, "OlacApi", {
            restApiName: "OLAC API",
            description: "API for the OLAC website back end functions"
        });

        const api = this.restApi.root.addResource("api");

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
                    ]
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
                    ]
                })
            }
        }

        this.apiVersion1(props, api, authorizers);
        this.apiVersion2(props, api, authorizers);
    }

    apiVersion1(props: ApiStackProps, api: apigateway.Resource, authorizers: Authorizers) {
        const echoIntegration = new apigateway.LambdaIntegration(props.echoFunction, {
            requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        });

        const publicApi = api.addResource("public");
        const publicClientConfig = publicApi.addResource("client-config");
        publicClientConfig.addMethod("GET", new apigateway.LambdaIntegration(props.getClientConfigFunction, {
            requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        }));
        const publicTicketTypes = publicApi.addResource("ticket-types");
        // GET
        publicTicketTypes.addMethod("GET", echoIntegration);
        const publicNewReservationIdConfig = publicApi.addResource("new-reservation-id");
        publicNewReservationIdConfig.addMethod("GET", new apigateway.LambdaIntegration(props.newReservationIdFunction, {
            requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        }));
        const publicReservations = publicApi.addResource("reservations");
        // POST
        publicReservations.addMethod("POST", echoIntegration);
        const publicReservationsAvailable = publicReservations.addResource("_available");
        // GET
        publicReservationsAvailable.addMethod("GET", echoIntegration);

        const event = api.addResource("event");
        const eventReservations = event.addResource("reservations");
        // GET
        eventReservations.addMethod("GET", echoIntegration, authorizers.eventCoordinator);
        const eventReservationsId = event.addResource("{reservationId}");
        // PUT
        eventReservationsId.addMethod("PUT", echoIntegration, authorizers.eventCoordinator);
        const eventReservationsCsv = event.addResource("reservations.csv");
        // GET
        eventReservationsCsv.addMethod("GET", echoIntegration, authorizers.eventCoordinator);

        const admin = api.addResource("admin");
        const adminTicketTypes = admin.addResource("ticket-types");
        // POST
        // DELETE
//        adminTicketTypes.addMethod("POST", echoIntegration, authorizers.admin);
        adminTicketTypes.addMethod("DELETE", echoIntegration, authorizers.admin);
        const adminReservations = admin.addResource("reservations");
        const adminReservationsID = adminReservations.addResource("{reservationId}");
        // DELETE
        adminReservationsID.addMethod("DELETE", echoIntegration, authorizers.admin);
        const adminReservationsIDAudit = adminReservationsID.addResource("audit");
        // GET
        adminReservationsIDAudit.addMethod("GET", echoIntegration, authorizers.admin);
        // *** Will probably not implement the admin accounts endpoints if using Cognity:
        const adminAccounts = admin.addResource("accounts");
        // GET
        // POST
        adminAccounts.addMethod("GET", echoIntegration, authorizers.admin);
        adminAccounts.addMethod("POST", echoIntegration, authorizers.admin);
        const adminAccountsUsername = adminAccounts.addResource("{username}");
        // PUT
        adminAccountsUsername.addMethod("PUT", echoIntegration, authorizers.admin);

        const auth = api.addResource("auth");
        const whoAmI = auth.addResource("who-am-i");
        // GET
        whoAmI.addMethod("GET", new apigateway.LambdaIntegration(props.whoAmIFunction, {
            requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        }));

        // *** Will probably not implement the Google authentication if Cognito works:
        // const google = auth.addResource("google-id");
        // // POST
        // google.addMethod("POST", echoIntegration);
    }

    apiVersion2(props: ApiStackProps, api: apigateway.Resource, authorizers: Authorizers) {
        // const echoIntegration = new apigateway.LambdaIntegration(props.echoFunction, {
        //     requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        // });

        const events = api.addResource("events");
        events.addMethod("GET", new apigateway.LambdaIntegration(props.eventListFunction, {
            requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        })/*, authorizers.admin */);
        events.addMethod("POST", new apigateway.LambdaIntegration(props.eventSaveFunction, {
            requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        })/*, authorizers.admin */);
    }
}

