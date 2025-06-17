import {Template} from "aws-cdk-lib/assertions";
import {App} from "aws-cdk-lib";
import {EventResourceStack} from "../../lib/stacks/resource/event-resource-stack";

let app: App;

describe("EventResourceStack", () => {
    beforeEach(() => {
        app = new App();
    })

    test("Event resource stack creation", () => {
        const stack = new EventResourceStack(app, "EventResourceStack", {});
        const template = Template.fromStack(stack);
        expect(template.toJSON()).toMatchSnapshot()///
    })
})
