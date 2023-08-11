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

interface OlacWebsiteStaticProps {
    domainNames: string[];
    certificateArn: string;
}

interface OlacConstructProps {
    websiteProps: OlacWebsiteStaticProps,
    configProps: ConfigUtilityStackProps,
    securityProps: SecurityUtilityStackProps
}

class OlacConstruct extends Construct {
    constructor(scope: Construct, id: string, props: OlacConstructProps) {
        super(scope, id);
        const configStack = new ConfigUtilityStack(this, 'ConfigUtility', props.configProps);
        const securityStack = new SecurityUtilityStack(this, 'SecurityUtility', props.securityProps);

        const eventStack = new EventResourceStack(this, 'EventResource', {});

        const adminStack = new AdministrationManagerStack(this, 'AdminManager', {
            getConfigFunction: configStack.getConfigLambda
        });
        const reservationStack = new ReservationManagerStack(this, 'ReservationManager', {
            saveReservationFunction: eventStack.saveReservationFunction
        });

        const apiStack = new ApiStack(this, 'Apis', {
            apiRoleARN: 'arn:aws:iam::543748744721:role/OlacDevApiRole',

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
            }
        });

        new OlacWebsiteStack(this, 'Website', {
            domainNames: props.websiteProps.domainNames,
            certificateArn: props.websiteProps.certificateArn,
            restApi: apiStack.restApi
        });

        // new GarbageStack(this, 'Garbage', {
        //     functionToDelete: adminStack.echoFunction
        // });
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
        enableReservations: false,
        cognito: {
            domain: 'https://omahalithuanians.auth.us-east-2.amazoncognito.com',
            clientId: '5nnetbctluvi4q512nlt51hkcl',
            redirectUri: 'https://dev.omahalithuanians.org'
        }
    },
    securityProps: {
        environment: 'Dev',
        userPoolId: 'us-east-2_LKok1DKIU',
        clientId: '5nnetbctluvi4q512nlt51hkcl'
    }
});
