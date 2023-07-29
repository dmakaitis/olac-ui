import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import {Construct} from 'constructs';

export interface ConfigUtilityStackProps extends cdk.StackProps {
    payPalApiBase: string,
    payPalClientId: string,
    enableReservations: boolean
}

export class ConfigUtilityStack extends cdk.Stack {

    readonly getConfigLambda: lambda.Function;

    constructor(scope: Construct, id: string, props: ConfigUtilityStackProps) {
        super(scope, id, props);

        this.getConfigLambda = new lambda.Function(this, 'GetConfiguration', {
            description: 'Returns the application configuration',
            runtime: lambda.Runtime.NODEJS_16_X,
            code: lambda.Code.fromAsset('./lambda/utility/config'),
            handler: 'get.handler',
            environment: {
                PAYPAL_API_BASE: props.payPalApiBase,
                PAYPAL_CLIENT_ID: props.payPalClientId,
                ENABLE_RESERVATIONS: JSON.stringify(props.enableReservations)
            },
        });
    }
}
