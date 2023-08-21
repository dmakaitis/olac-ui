#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs'

import {ConfigUtilityStack, ConfigUtilityStackProps} from "../lib/utility/config-utility-stack";
import {SecurityUtilityStack, SecurityUtilityStackProps} from "../lib/utility/security-utility-stack";
import {EventResourceStack} from "../lib/resource/event-resource-stack";
import {AdministrationManagerStack} from "../lib/manager/administration-manager-stack";
import {ReservationManagerStack} from "../lib/manager/reservation-manager-stack";

import {OlacWebsiteStack} from '../lib/client/olac-website-stack';
import {ApiStack} from "../lib/client/api-stack";

interface OlacConstructProps {
    environment: string,
    website: {
        domainNames: string[];
        certificateArn: string;
    },
    payPal: {
        apiBase: string,
        clientId: string,
        secret: string,
        donationButtonId: string
    },
    security: {
        apiRoleArn: string,
        cognito: {
            userPoolId: string,
            domain: string,
            clientId: string,
            redirectUri: string
        }
    }
}

class OlacConstruct extends Construct {
    constructor(scope: Construct, id: string, props: OlacConstructProps) {
        super(scope, id);
        const configStack = new ConfigUtilityStack(this, 'ConfigUtility', {
            payPal: {
                apiBase: props.payPal.apiBase,
                clientId: props.payPal.clientId,
                donationButtonId: props.payPal.donationButtonId
            },
            cognito: {
                domain: props.security.cognito.domain,
                clientId: props.security.cognito.clientId,
                redirectUri: props.security.cognito.redirectUri
            }
        });
        const securityStack = new SecurityUtilityStack(this, 'SecurityUtility', {
            environment: props.environment,
            userPoolId: props.security.cognito.userPoolId,
            clientId: props.security.cognito.clientId
        });

        const eventStack = new EventResourceStack(this, 'EventResource', {});

        const adminStack = new AdministrationManagerStack(this, 'AdminManager', {
            getConfigFunction: configStack.getConfigLambda
        });
        const reservationStack = new ReservationManagerStack(this, 'ReservationManager', {
            saveReservationFunction: eventStack.saveReservationFunction,
            payPal: props.payPal
        });

        const apiStack = new ApiStack(this, 'Apis', {
            apiRoleARN: props.security.apiRoleArn,

            getClientConfigFunction: adminStack.getClientConfigFunction,
            whoAmIFunction: securityStack.whoAmIFunction,

            newReservationIdFunction: reservationStack.apiGetNewReservationIdFunction,

            eventListFunction: eventStack.listEventsFunction,
            eventSaveFunction: eventStack.saveEventFunction,
            eventDeleteFunction: eventStack.deleteEventFunction,

            eventsTable: eventStack.eventsTable,
            auditTable: eventStack.auditTable,

            reservationListFunction: eventStack.listReservationsFunction,
            reservationListCsvFunction: eventStack.listReservationsCsvFunction,
            reservationSaveFunction: reservationStack.apiSaveReservationAdminFunction,
            reservationDeleteFunction: eventStack.deleteReservationFunction,

            postNewReservationFunction: reservationStack.apiSaveReservationFunction,

            areTicketsAvailableFunction: eventStack.areTicketsAvailableFunction,

            grantGroupMap: {
                admin: securityStack.adminUserGroup,
                eventCoordinator: securityStack.eventCoordinatorUserGroup
            },

            cognitoUserPoolId: props.security.cognito.userPoolId,
            cognitoClientId: props.security.cognito.clientId
        });

        new OlacWebsiteStack(this, 'Website', {
            domainNames: props.website.domainNames,
            certificateArn: props.website.certificateArn,
            restApi: apiStack.restApi
        });

        // new GarbageStack(this, 'Garbage', {
        //     functionToDelete: adminStack.echoFunction
        // });
    }
}

const app = new cdk.App();

new OlacConstruct(app, 'Dev', {
    environment: 'Dev',
    website: {
        domainNames: ['dev.omahalithuanians.org'],
        certificateArn: 'arn:aws:acm:us-east-1:543748744721:certificate/d82d9aa8-4c48-47e0-8970-7cdd385679f9'
    },
    payPal: {
        apiBase: 'https://api-m.sandbox.paypal.com',
        clientId: 'Abho_XH0WoNgTUb4dlLPUXvKzWWhrBVrgVoZcc6O3YSZL80WKf-f8F6ow09WZnrL4QnOmX7yz46GCzdc',
        secret: 'EHvGFTVVzX8iKJ6rGl0L3--NxTU3qIphBYBytPMG-gkeVSmHQJPEujRGSmT73aftkd5G1qJdWFHNT5S2',
        donationButtonId: 'TNJPYZR28EC7G'
    },
    security: {
        apiRoleArn: 'arn:aws:iam::543748744721:role/OlacDevApiRole',
        cognito: {
            userPoolId: 'us-east-2_LKok1DKIU',
            domain: 'https://omahalithuanians.auth.us-east-2.amazoncognito.com',
            clientId: '5nnetbctluvi4q512nlt51hkcl',
            redirectUri: 'https://dev.omahalithuanians.org'
        }
    }
});

new OlacConstruct(app, 'Test', {
    environment: 'Test',
    website: {
        domainNames: ['test.omahalithuanians.org'],
        certificateArn: 'arn:aws:acm:us-east-1:543748744721:certificate/d634888b-e3a2-4e88-8e77-687556c68dd5'
    },
    payPal: {
        apiBase: 'https://api-m.sandbox.paypal.com',
        clientId: 'Abho_XH0WoNgTUb4dlLPUXvKzWWhrBVrgVoZcc6O3YSZL80WKf-f8F6ow09WZnrL4QnOmX7yz46GCzdc',
        secret: 'EHvGFTVVzX8iKJ6rGl0L3--NxTU3qIphBYBytPMG-gkeVSmHQJPEujRGSmT73aftkd5G1qJdWFHNT5S2',
        donationButtonId: 'N4ZY3QGD6CMVN'
    },
    security: {
        apiRoleArn: 'arn:aws:iam::543748744721:role/OlacTestApiRole',
        cognito: {
            userPoolId: 'us-east-2_LKok1DKIU',
            domain: 'https://omahalithuanians.auth.us-east-2.amazoncognito.com',
            clientId: '5mf492piqlmeahu5nf7mu9n7ra',
            redirectUri: 'https://test.omahalithuanians.org'
        }
    }
});
