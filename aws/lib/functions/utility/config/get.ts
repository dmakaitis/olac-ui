type PayPalConfig = {
    "api-base": string | undefined;
    client: string | undefined;
    donationButtonId: string | undefined;
}

type CognitoConfig = {
    domain: string | undefined;
    clientId: string | undefined;
    redirectUri: string | undefined;
}

type OlacConfig = {
    paypal: PayPalConfig;
    cognito: CognitoConfig;
}

export type Config = {
    olac: OlacConfig;
}

export async function handler(event: any, context: any) : Promise<Config> {
    return {
        "olac": {
            "paypal": {
                "api-base": process.env.PAYPAL_API_BASE,
                "client": process.env.PAYPAL_CLIENT_ID,
                "donationButtonId": process.env.PAYPAL_DONATION_BUTTON_ID
            },
            "cognito": {
                "domain": process.env.COGNITO_DOMAIN,
                "clientId": process.env.COGNITO_CLIENT_ID,
                "redirectUri": process.env.COGNITO_REDIRECT_URI
            }
        }
    }
}
