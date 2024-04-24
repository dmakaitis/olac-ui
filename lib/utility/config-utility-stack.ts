import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import {Construct} from 'constructs';

export interface ConfigUtilityStackProps extends cdk.StackProps {
    payPal: {
        apiBase: string,
        clientId: string,
        donationButtonId: string
    },
    cognito: {
        domain: string,
        clientId: string,
        redirectUri: string
    }
}

export class ConfigUtilityStack extends cdk.Stack {

    readonly getConfigLambda: lambda.Function;

    constructor(scope: Construct, id: string, props: ConfigUtilityStackProps) {
        super(scope, id, props);

        this.getConfigLambda = new lambda.Function(this, 'GetConfiguration', {
            description: 'Returns the application configuration',
            runtime: lambda.Runtime.NODEJS_18_X,
            code: lambda.Code.fromAsset('./lambda/utility/config'),
            handler: 'get.handler',
            environment: {
                PAYPAL_API_BASE: props.payPal.apiBase,
                PAYPAL_CLIENT_ID: props.payPal.clientId,
                PAYPAL_DONATION_BUTTON_ID: props.payPal.donationButtonId,
                COGNITO_DOMAIN: props.cognito.domain,
                COGNITO_CLIENT_ID: props.cognito.clientId,
                COGNITO_REDIRECT_URI: props.cognito.redirectUri
            },
        });
    }
}
