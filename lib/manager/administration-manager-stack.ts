import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import {Construct} from 'constructs';

export interface AdministrationManagerStackProps extends cdk.StackProps {
    getConfigFunction: lambda.Function
}

export class AdministrationManagerStack extends cdk.Stack {

    readonly getClientConfigFunction: lambda.Function;

    constructor(scope: Construct, id: string, props: AdministrationManagerStackProps) {
        super(scope, id, props);

        this.getClientConfigFunction = new lambda.Function(this, 'GetClientConfig', {
            description: 'Retrieve the client configuration for the UI',
            runtime: lambda.Runtime.NODEJS_16_X,
            code: lambda.Code.fromAsset('./lambda/manager/administration'),
            handler: 'get-client-config.handler',
            environment: {
                GET_CONFIG_FUNCTION: props.getConfigFunction.functionName
            },
        });

        props.getConfigFunction.grantInvoke(this.getClientConfigFunction);
    }
}