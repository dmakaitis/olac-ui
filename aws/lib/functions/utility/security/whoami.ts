import {CognitoJwtVerifier} from "aws-jwt-verify";

export async function handler(event: any, context: any): Promise<any> {
    const verifier = CognitoJwtVerifier.create({
        userPoolId: process.env.USER_POOL_ID || 'us-east-2_LKok1DKIU',
        tokenUse: 'access',
        clientId: process.env.CLIENT_ID || '5nnetbctluvi4q512nlt51hkcl',
    });

    try {
        const payload = await verifier.verify(event.headers.Authorization);

        const grants: string[] = [];

        if (payload["cognito:groups"]?.includes(process.env.ADMIN_GROUP_NAME || '__NOTHING__')) {
            grants.push("ROLE_ADMIN");
            grants.push("ROLE_EVENT_COORDINATOR");
        } else if (payload["cognito:groups"]?.includes(process.env.EVENT_COORDINATOR_GROUP_NAME || '__NOTHING__')) {
            grants.push("ROLE_EVENT_COORDINATOR");
        }


        return {
            statusCode: 200,
            body: JSON.stringify({
                username: payload.username,
                grants: grants
            }),
            headers: {
                "Set-Cookie": "ShowLoginButton=Y; Max-Age=15552000; Path=/"
            }
        }
    } catch {
        return {
            statusCode: 200,
            body: JSON.stringify({
                username: 'anonymous',
                grants: []
            })
        };
    }
}
