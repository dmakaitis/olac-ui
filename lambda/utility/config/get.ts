import {Handler} from 'aws-lambda';

export const handler: Handler = async (event, context) => {
    return {
        "olac": {
            "enable-reservations": JSON.parse(process.env.ENABLE_RESERVATIONS || "false"),
            "paypal": {
                "api-base": process.env.PAYPAL_API_BASE,
                "client": process.env.PAYPAL_CLIENT_ID
            },
            "cognito": {
                "domain": process.env.COGNITO_DOMAIN,
                "clientId": process.env.COGNITO_CLIENT_ID,
                "redirectUri": process.env.COGNITO_REDIRECT_URI
            }
        }
    }
}
