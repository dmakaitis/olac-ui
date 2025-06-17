import {ConfigUtilityStack} from "../../lib/stacks/utility/config-utility-stack";
import {Template} from "aws-cdk-lib/assertions";
import {App} from "aws-cdk-lib";

let app: App;

describe("ConfigUtilityStack", () => {
    beforeEach(() => {
        app = new App();
    })

    test("Config utility stack creation", () => {
        const stack = new ConfigUtilityStack(app, "ConfigUtilityStack", {
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
        const template = Template.fromStack(stack);
        expect(template.toJSON()).toMatchSnapshot()///
    })
})
