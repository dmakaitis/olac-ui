import {APIGatewayRequestAuthorizerEvent, AuthResponse, Handler} from "aws-lambda";
import {CognitoJwtVerifier} from "aws-jwt-verify";

interface UserInfo {
    username: string,
    grants: Array<string>,
    groups: Array<string>
}

export const handler: Handler = async (event: APIGatewayRequestAuthorizerEvent): Promise<AuthResponse> => {
    const verifier = CognitoJwtVerifier.create({
        userPoolId: process.env.USER_POOL_ID || 'us-east-2_LKok1DKIU',
        tokenUse: 'access',
        clientId: process.env.CLIENT_ID || '5nnetbctluvi4q512nlt51hkcl',
    });

    const requiredGroups: Array<string> = (process.env.REQUIRED_GROUPS || '').split(" ");

    var token = (event.headers || {}).Authorization;
    var userInfo: UserInfo;
    var effect: string = 'Deny';

    try {
        const payload = await verifier.verify(token || '');

        if(requiredGroups.length == 0) {
            effect = 'Allow';
        } else {
            requiredGroups.forEach(g => {
                if(payload["cognito:groups"]?.includes(g)) {
                    effect = 'Allow';
                }
            })
        }
        userInfo = {
            username: payload.username,
            grants: [],
            groups: payload["cognito:groups"] || []
        }
    } catch {
        userInfo = {
            username: 'anonymous',
            grants: [],
            groups: []
        }
    }

    let policy = generatePolicy(userInfo, effect, event.methodArn);

    return policy;
}

function generatePolicy(userInfo: UserInfo, effect: string, resource: string): AuthResponse {
    return {
        principalId: userInfo.username,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [{
                Action: 'execute-api:Invoke',
                Effect: effect,
                Resource: resource
            }]
        },
        context: {
            "username": userInfo.username,
            "grants": userInfo.grants.join(" "),
            "groups": userInfo.groups.join(" ")
        }
    };
}
