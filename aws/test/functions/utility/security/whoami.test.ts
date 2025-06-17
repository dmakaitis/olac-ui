import {handler} from "../../../../lambda/utility/security/whoami"
import {Context} from "aws-lambda";

const event = {} as any;
const context = {} as any as Context;

describe("SecurityUtility.whoami", () => {
    test("Get current user information", async () => {
        const result = await handler(event, context);
        expect(result).toStrictEqual({
            statusCode: 200,
            body: JSON.stringify({
                username: 'anonymous',
                grants: []
            })
        })
    })
})
