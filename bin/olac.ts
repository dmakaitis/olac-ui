#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs'

import {ConfigUtilityStack, ConfigUtilityStackProps} from "../lib/utility/config-utility-stack";
import {EventResourceStack} from "../lib/resource/event-resource-stack";
import {AdministrationManagerStack} from "../lib/manager/administration-manager-stack";
import {ReservationManagerStack} from "../lib/manager/reservation-manager-stack";

import {OlacWebsiteStack} from '../lib/client/olac-website-stack';
import {ApiStack} from "../lib/client/api-stack";

interface OlacWebsiteStaticProps {
    domainNames: string[];
    certificateArn: string;
}

interface OlacConstructProps {
    websiteProps: OlacWebsiteStaticProps,
    configProps: ConfigUtilityStackProps
}

class OlacConstruct extends Construct {
    constructor(scope: Construct, id: string, props: OlacConstructProps) {
        super(scope, id);
        const configStack = new ConfigUtilityStack(this, 'ConfigUtility', props.configProps);

        new EventResourceStack(this, 'EventResource', {});

        const adminStack = new AdministrationManagerStack(this, 'AdminManager', {
            getConfigFunction: configStack.getConfigLambda
        });
        const reservationStack = new ReservationManagerStack(this, 'ReservationManager', {

        });

        const apiStack = new ApiStack(this, 'Apis', {
            getClientConfigFunction: adminStack.getClientConfigFunction,

            newReservationIdFunction: reservationStack.getNewReservationIdFunction
        });

        new OlacWebsiteStack(this, 'Website', {
            domainNames: props.websiteProps.domainNames,
            certificateArn: props.websiteProps.certificateArn,
            restApi: apiStack.restApi
        });
    }
}

const app = new cdk.App();

new OlacConstruct(app, 'Dev', {
    websiteProps: {
        domainNames: ['dev.omahalithuanians.org'],
        certificateArn: 'arn:aws:acm:us-east-1:543748744721:certificate/d82d9aa8-4c48-47e0-8970-7cdd385679f9'
    },
    configProps: {
        payPalApiBase: 'https://api-m.paypal.com',
        payPalClientId: 'AWlSY8P90RHz_lXFE_37F9e_8RZ4w3Vng1mYF4-U6EWlVlRIBFbE21UTxMSE36ry0dJLI_VDwzDh5Mbm',
        enableReservations: false
    }
});

// new ApiStack(app, 'OlacPublicApiStack', {
// })

// new OlacWebsiteStack(app, 'OlacStack', {
//
//     /* If you don't specify 'env', this stack will be environment-agnostic.
//      * Account/Region-dependent features and context lookups will not work,
//      * but a single synthesized template can be deployed anywhere. */
//
//     /* Uncomment the next line to specialize this stack for the AWS Account
//      * and Region that are implied by the current CLI configuration. */
//     // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
//
//     /* Uncomment the next line if you know exactly what Account and Region you
//      * want to deploy the stack to. */
//     // env: { account: '123456789012', region: 'us-east-1' },
//
//     /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
//
//     domainNames: [ 'dev.omahalithuanians.org' ],
//     certificateArn: 'arn:aws:acm:us-east-1:543748744721:certificate/d82d9aa8-4c48-47e0-8970-7cdd385679f9'
//
// });