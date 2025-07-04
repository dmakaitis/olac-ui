import {Template} from "aws-cdk-lib/assertions";
import {App} from "aws-cdk-lib";
import {AdministrationManagerStack} from "../../lib/stacks/manager/administration-manager-stack";
import {ConfigUtilityStack} from "../../lib/stacks/utility/config-utility-stack";
import {ApiStack} from "../../lib/stacks/client/api-stack";
import {SecurityUtilityStack} from "../../lib/stacks/utility/security-utility-stack";
import {EventResourceStack} from "../../lib/stacks/resource/event-resource-stack";
import {ReservationManagerStack} from "../../lib/stacks/manager/reservation-manager-stack";

let app: App;
let security: SecurityUtilityStack;
let config: ConfigUtilityStack;
let event: EventResourceStack;
let reservation: ReservationManagerStack;
let admin: AdministrationManagerStack;

describe("ApiStack", () => {
    beforeEach(() => {
        app = new App();

        security = new SecurityUtilityStack(app, "SecurityUtilityStack", {
            clientId: "client-id",
            environment: "test",
            userPoolId: "user-pool-id"
        });

        config = new ConfigUtilityStack(app, "ConfigUtilityStack", {
            cognito: {
                clientId: "test-cognito-client-id",
                domain: "test.domain.com",
                redirectUri: "https://test.domain.com/redirect"
            },
            payPal: {
                apiBase: "https://test.paypal.com/api",
                clientId: "test-paypal-client-id",
                donationButtonId: "test-paypal-button-id"
            }
        });

        event = new EventResourceStack(app, "EventResourceStack", {});

        reservation = new ReservationManagerStack(app, "ReservationManagerStack", {
            payPal: {
                apiBase: "https://test.paypal.com/api",
                clientId: "test-paypal-client-id",
                secret: "my-paypal-secret"
            },
            saveReservationFunction: event.saveReservationFunction,
            eventsTable: event.eventsTable
        });

        admin = new AdministrationManagerStack(app, "AdministrationManagerStack", {
            getConfigFunction: config.getConfigLambda
        });
    })

    test("API stack creation", () => {
        const stack = new ApiStack(app, "ApiStack", {
            apiRoleARN: "arn:aws:iam::543748744721:role/OlacDevApiRole",
            cognitoClientId: "client-id",
            cognitoUserPoolId: "user-pool-id",

            grantGroupMap: {
                admin: security.adminUserGroup,
                eventCoordinator: security.eventCoordinatorUserGroup
            },

            newReservationIdFunction: reservation.apiGetNewReservationIdFunction,
            postNewReservationFunction: reservation.apiSaveReservationFunction,
            reservationSaveFunction: reservation.apiSaveReservationAdminFunction,
            getEventFunction: reservation.apiGetEventFunction,

            getClientConfigFunction: admin.getClientConfigFunction,

            auditTable: event.auditTable,
            eventsTable: event.eventsTable,

            areTicketsAvailableFunction: event.areTicketsAvailableFunction,
            eventDeleteFunction: event.deleteEventFunction,
            eventListFunction: event.listEventsFunction,
            eventSaveFunction: event.saveEventFunction,
            reservationDeleteFunction: event.deleteReservationFunction,
            reservationListCsvFunction: event.listReservationsCsvFunction,
            reservationListFunction: event.listReservationsFunction,

            whoAmIFunction: security.whoAmIFunction

        });
        const template = Template.fromStack(stack);
        expect(template.toJSON()).toMatchSnapshot()///
    })
})
