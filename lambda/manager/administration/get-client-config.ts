import {Handler} from 'aws-lambda';
import {LambdaClient, InvokeCommand, LogType} from "@aws-sdk/client-lambda";

export const handler: Handler = async (event, context) => {
    const client = new LambdaClient({region: "us-east-2"})
    const command = new InvokeCommand({
        FunctionName: process.env.GET_CONFIG_FUNCTION,
        Payload: "{}",
        LogType: LogType.Tail
    });

    console.log(`Received event: ${JSON.stringify(event)}`);

    const {Payload, LogResult} = await client.send(command);
    const config = JSON.parse(Buffer.from(Payload || "{}").toString());

    const showLogin = doesCookieExist(event.headers);

    return {
        statusCode: 200,
        body: JSON.stringify({
            "paypal": {
                "apiBase": config.olac.paypal["api-base"],
                "clientId": config.olac.paypal.client
            },
            "showLogin": showLogin,
            "enableReservations": config.olac["enable-reservations"]
        })
    }
}

function doesCookieExist(headers: any): boolean {
    if (headers === null || headers === undefined || headers.Cookie === undefined) {
        return false;
    }

    const rc: string = headers.Cookie;
    var cookieFound: boolean = false;

    rc && rc.split(';').forEach(function (cookie: string) {
        if(cookie === "ShowLoginButton=Y") {
            cookieFound = true;
        }
    });

    return cookieFound;
}
