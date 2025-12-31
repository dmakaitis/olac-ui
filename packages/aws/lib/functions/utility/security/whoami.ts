import {CognitoJwtVerifier} from "aws-jwt-verify";
import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda";
import {getSecurityUtility} from "@olac/security-utility";
import {UserData} from "@olac/types";

const securityUtility = getSecurityUtility();

export async function handler(event: APIGatewayProxyEvent, _context: Context): Promise<APIGatewayProxyResult> {
    const verifier = CognitoJwtVerifier.create({
        userPoolId: process.env.USER_POOL_ID || 'us-east-2_LKok1DKIU',
        tokenUse: 'access',
        clientId: process.env.CLIENT_ID || '5nnetbctluvi4q512nlt51hkcl',
    });

    let userData: UserData = {
        username: 'anonymous',
        grants: []
    }

    try {
        const payload = await verifier.verify(event.headers.Authorization || "");
        userData = securityUtility.getCurrentUser(payload);
    } catch {
        // Ignore any errors
    }

    return {
        statusCode: 200,
        body: JSON.stringify(userData)
    };
}
