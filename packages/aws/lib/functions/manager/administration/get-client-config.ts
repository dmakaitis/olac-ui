import {LambdaClient, InvokeCommand, LogType} from "@aws-sdk/client-lambda";

export async function handler(event: any, _context: any) : Promise<any> {
    const client = new LambdaClient({region: "us-east-2"})
    const command = new InvokeCommand({
        FunctionName: process.env.GET_CONFIG_FUNCTION,
        Payload: "{}",
        LogType: LogType.Tail
    });

    console.log(`Received event: ${JSON.stringify(event)}`);

    const {Payload, } = await client.send(command);
    const config = JSON.parse(Buffer.from(Payload || "{}").toString());

    const showLogin = doesCookieExist(event.headers);

    return {
        statusCode: 200,
        body: JSON.stringify({
            "paypal": {
                "apiBase": config.olac.paypal["api-base"],
                "clientId": config.olac.paypal.client,
                "donationButtonId": config.olac.paypal.donationButtonId
            },
            "cognito": {
                "domain": config.olac.cognito.domain,
                "clientId": config.olac.cognito.clientId,
                "redirectUri": config.olac.cognito.redirectUri
            },
            showLogin
        })
    }
}

function doesCookieExist(headers: any): boolean {
    let cookieFound: boolean = false;

    headers?.Cookie?.split(';').forEach(function (cookie: string) {
        if (cookie === "ShowLoginButton=Y") {
            cookieFound = true;
        }
    });

    return cookieFound;
}
