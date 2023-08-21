import {Handler} from 'aws-lambda';

export const handler: Handler = async (event, context) => {
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
