import {Template} from "aws-cdk-lib/assertions";
import {App} from "aws-cdk-lib";
import {Function} from "aws-cdk-lib/aws-lambda"
import {ReservationManagerStack} from "../../lib/stacks/manager/reservation-manager-stack";
import {EventResourceStack} from "../../lib/stacks/resource/event-resource-stack";

let app: App;
let saveReservationFunction: Function;

describe("ReservationManagerStack", () => {
    beforeEach(() => {
        app = new App();

        const eventStack = new EventResourceStack(app, "EventResourceStack", {});
        saveReservationFunction = eventStack.saveReservationFunction
    })

    test("Config utility stack creation", () => {
        const stack = new ReservationManagerStack(app, "ReservationManagerStack", {
            payPal: {
                apiBase: "https://test.paypal.com/api",
                clientId: "test-paypal-client-id",
                secret: "my-paypal-secret"
            },
            saveReservationFunction: saveReservationFunction
        });
        const template = Template.fromStack(stack);
        expect(template.toJSON()).toMatchSnapshot()///
    })
})
