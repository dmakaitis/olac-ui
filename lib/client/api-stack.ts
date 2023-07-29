import * as cdk from 'aws-cdk-lib';
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import {Function} from 'aws-cdk-lib/aws-lambda';
import {Construct} from 'constructs';

interface ApiStackProps extends cdk.StackProps {
    getClientConfigFunction: Function,
    newReservationIdFunction: Function
}

export class ApiStack extends cdk.Stack {

    readonly restApi: apigateway.RestApi;

    constructor(scope: Construct, id: string, props: ApiStackProps) {
        super(scope, id, props);

        this.restApi = new apigateway.RestApi(this, "OlacApi", {
            restApiName: "OLAC API",
            description: "API for the OLAC website back end functions"
        });

        const getConfigIntegration = new apigateway.LambdaIntegration(props.getClientConfigFunction, {
            requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        });
        const newReservationIdIntegration = new apigateway.LambdaIntegration(props.newReservationIdFunction, {
            requestTemplates: {"application/json": '{ "statusCode": "200" }'}
        })

        const api = this.restApi.root.addResource("api");

        const publicApi = api.addResource("public");

        const clientConfig = publicApi.addResource("client-config");
        clientConfig.addMethod("GET", getConfigIntegration);

        const newReservationIdConfig = publicApi.addResource("new-reservation-id");
        newReservationIdConfig.addMethod("GET", newReservationIdIntegration);
    }
}