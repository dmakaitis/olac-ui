import {Template} from "aws-cdk-lib/assertions";
import {App} from "aws-cdk-lib";
import {SecurityUtilityStack} from "../../lib/stacks/utility/security-utility-stack";

let app: App;

describe("SecurityUtilityStack", () => {
    beforeEach(() => {
        app = new App();
    })

    test("Config utility stack creation", () => {
        const stack = new SecurityUtilityStack(app, "SecurityUtilityStack", {
            clientId: "client-id",
            environment: "test",
            userPoolId: "user-pool-id"
        });
        const template = Template.fromStack(stack);
        expect(template.toJSON()).toMatchSnapshot()///
    })
})
