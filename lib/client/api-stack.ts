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

    grantGroupMap: {
        admin: Array<cognito.CfnUserPoolGroup>,
        eventCoordinator: Array<cognito.CfnUserPoolGroup>
    }
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

        this.apiVersion1(props, api);
        this.apiVersion2(props, api);
    }

    apiVersion1(props: ApiStackProps, api: apigateway.Resource) {
        const eventCoordinatorAuthorizerFunction = new lambda.Function(this, 'EventCoordinatorAuthorizerFunction', {
            description: 'API Gateway Event Coordinator Authorizer',
            runtime: lambda.Runtime.NODEJS_16_X,
            code: lambda.Code.fromAsset('./lambda/utility/security'),
            handler: 'authorize.handler',
            environment: {
                REQUIRED_GROUPS: props.grantGroupMap.eventCoordinator.map(g => g.groupName).join(" ")
            }
        });
        const adminAuthorizerFunction = new lambda.Function(this, 'AdminAuthorizerFunction', {
            description: 'API Gateway Admin Authorizer',
            runtime: lambda.Runtime.NODEJS_16_X,
            code: lambda.Code.fromAsset('./lambda/utility/security'),
            handler: 'authorize.handler',
            environment: {
                REQUIRED_GROUPS: props.grantGroupMap.admin.map(g => g.groupName).join(" ")
            }
        });

        const requireEventCoordinator: MethodOptions = {
            authorizationType: apigateway.AuthorizationType.CUSTOM,
            authorizer: new apigateway.RequestAuthorizer(this, 'EventCoordinatorAuthorizer', {
                handler: eventCoordinatorAuthorizerFunction,
                identitySources: [
                    apigateway.IdentitySource.header('Authorization')
                ]
            })
        };
        const requireAdmin: MethodOptions = {
            authorizationType: apigateway.AuthorizationType.CUSTOM,
            authorizer: new apigateway.RequestAuthorizer(this, 'AdminAuthorizer', {
                handler: adminAuthorizerFunction,
                identitySources: [
                    apigateway.IdentitySource.header('Authorization')
                ]
            })
        };

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
        eventReservations.addMethod("GET", echoIntegration, requireEventCoordinator);
        const eventReservationsId = event.addResource("{reservationId}");
        // PUT
        eventReservationsId.addMethod("PUT", echoIntegration, requireEventCoordinator);
        const eventReservationsCsv = event.addResource("reservations.csv");
        // GET
        eventReservationsCsv.addMethod("GET", echoIntegration, requireEventCoordinator);

        const admin = api.addResource("admin");
        const adminTicketTypes = admin.addResource("ticket-types");
        // POST
        // DELETE
        adminTicketTypes.addMethod("POST", echoIntegration, requireAdmin);
        adminTicketTypes.addMethod("DELETE", echoIntegration, requireAdmin);
        const adminReservations = admin.addResource("reservations");
        const adminReservationsID = adminReservations.addResource("{reservationId}");
        // DELETE
        adminReservationsID.addMethod("DELETE", echoIntegration, requireAdmin);
        const adminReservationsIDAudit = adminReservationsID.addResource("audit");
        // GET
        adminReservationsIDAudit.addMethod("GET", echoIntegration, requireAdmin);
        // *** Will probably not implement the admin accounts endpoints if using Cognity:
        const adminAccounts = admin.addResource("accounts");
        // GET
        // POST
        adminAccounts.addMethod("GET", echoIntegration, requireAdmin);
        adminAccounts.addMethod("POST", echoIntegration, requireAdmin);
        const adminAccountsUsername = adminAccounts.addResource("{username}");
        // PUT
        adminAccountsUsername.addMethod("PUT", echoIntegration, requireAdmin);

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

    apiVersion2(props: ApiStackProps, api: apigateway.Resource) {
        // const echoIntegration = new apigateway.LambdaIntegration(props.echoFunction, {
        //     requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        // });
    }
}

