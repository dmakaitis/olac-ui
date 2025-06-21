import {Template} from "aws-cdk-lib/assertions";
import {App} from "aws-cdk-lib";
import {AdministrationManagerStack} from "../../lib/stacks/manager/administration-manager-stack";
import {Function} from "aws-cdk-lib/aws-lambda"
import {ConfigUtilityStack} from "../../lib/stacks/utility/config-utility-stack";

let app: App;
let configFunction: Function;

describe("AdministrationManagerStack", () => {
    beforeEach(() => {
        app = new App();

        const configStack = new ConfigUtilityStack(app, "ConfigUtilityStack", {
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
        configFunction = configStack.getConfigLambda
    })

    test("Administration manager stack creation", () => {
        const stack = new AdministrationManagerStack(app, "AdministrationManagerStack", {
            getConfigFunction: configFunction
        });
        const template = Template.fromStack(stack);
        expect(template.toJSON()).toMatchSnapshot()///
    })
})
