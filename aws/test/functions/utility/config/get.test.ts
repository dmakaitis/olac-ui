import {handler} from "../../../../lib/functions/utility/config/get"
import {Context} from "aws-lambda";

const event = {} as any;
const context = {} as any as Context;

describe("ConfigUtility.get", () => {
    test("Get configuration", async () => {
        const result = await handler(event, context);
        expect(result).toStrictEqual({
            olac: {
                paypal: {
                    "api-base": undefined,
                    client: undefined,
                    donationButtonId: undefined
                },
                cognito: {
                    clientId: undefined,
                    domain: undefined,
                    redirectUri: undefined,
                }
            }
        })
    })
})
