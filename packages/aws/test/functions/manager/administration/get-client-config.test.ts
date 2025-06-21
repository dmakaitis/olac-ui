import {handler} from "../../../../lib/functions/manager/administration/get-client-config"
import {Context} from "aws-lambda";
import {mockClient} from "aws-sdk-client-mock"
import {InvokeCommand, LambdaClient} from "@aws-sdk/client-lambda"
import {Uint8ArrayBlobAdapter} from "@smithy/util-stream";

const event = {} as any;
const context = {} as any as Context;

const lambdaMock = mockClient(LambdaClient);

const config = {
    olac: {
        paypal: {
            "api-base": "https://api.paypal.com",
            client: "my-client-id",
            donationButtonId: "my-button-id"
        },
        cognito: {
            domain: "cognito-domain",
            clientId: "cognito-client-id",
            redirectUri: "https://my.app.com"
        }
    }
}

describe("AdministrationManager.get-client-config", () => {
    beforeEach(() => {
        lambdaMock.reset();
    })

    test("Get configuration with no headers", async () => {
        lambdaMock.on(InvokeCommand).resolves({
            Payload: Uint8ArrayBlobAdapter.fromString(JSON.stringify(config))
        });

        const result = await handler(event, context);
        expect(result.statusCode).toEqual(200);

        const body = JSON.parse(result.body);
        expect(body).toStrictEqual({
            paypal: {
                apiBase: config.olac.paypal["api-base"],
                clientId: config.olac.paypal.client,
                donationButtonId: config.olac.paypal.donationButtonId
            },
            cognito: {
                clientId: config.olac.cognito.clientId,
                domain: config.olac.cognito.domain,
                redirectUri: config.olac.cognito.redirectUri,
            },
            showLogin: false
        })
    })

    test("Get configuration with no cookies", async () => {
        lambdaMock.on(InvokeCommand).resolves({
            Payload: Uint8ArrayBlobAdapter.fromString(JSON.stringify(config))
        });

        event.headers = {}

        const result = await handler(event, context);
        expect(result.statusCode).toEqual(200);

        const body = JSON.parse(result.body);
        expect(body).toStrictEqual({
            paypal: {
                apiBase: config.olac.paypal["api-base"],
                clientId: config.olac.paypal.client,
                donationButtonId: config.olac.paypal.donationButtonId
            },
            cognito: {
                clientId: config.olac.cognito.clientId,
                domain: config.olac.cognito.domain,
                redirectUri: config.olac.cognito.redirectUri,
            },
            showLogin: false
        })
    })

    test("Get configuration with login cookie present", async () => {
        lambdaMock.on(InvokeCommand).resolves({
            Payload: Uint8ArrayBlobAdapter.fromString(JSON.stringify(config))
        });

        event.headers = {
            Cookie: "MyCookie=A;ShowLoginButton=Y;MyCookie=B"
        }

        const result = await handler(event, context);
        expect(result.statusCode).toEqual(200);

        const body = JSON.parse(result.body);
        expect(body).toStrictEqual({
            paypal: {
                apiBase: config.olac.paypal["api-base"],
                clientId: config.olac.paypal.client,
                donationButtonId: config.olac.paypal.donationButtonId
            },
            cognito: {
                clientId: config.olac.cognito.clientId,
                domain: config.olac.cognito.domain,
                redirectUri: config.olac.cognito.redirectUri,
            },
            showLogin: true
        })
    })


    test("Get configuration with login cookie absent", async () => {
        lambdaMock.on(InvokeCommand).resolves({
            Payload: Uint8ArrayBlobAdapter.fromString(JSON.stringify(config))
        });

        event.headers = {
            Cookie: "MyCookie=A;MyCookie=B"
        }

        const result = await handler(event, context);
        expect(result.statusCode).toEqual(200);

        const body = JSON.parse(result.body);
        expect(body).toStrictEqual({
            paypal: {
                apiBase: config.olac.paypal["api-base"],
                clientId: config.olac.paypal.client,
                donationButtonId: config.olac.paypal.donationButtonId
            },
            cognito: {
                clientId: config.olac.cognito.clientId,
                domain: config.olac.cognito.domain,
                redirectUri: config.olac.cognito.redirectUri,
            },
            showLogin: false
        })
    })
})
