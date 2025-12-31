import {GrantCollection, JwtToken, UserData} from "@olac/types";

export function getCurrentUser(accessToken: JwtToken): UserData {
    const username = accessToken?.username || 'anonymous';
    const grants: GrantCollection = [];

    if (accessToken["cognito:groups"]?.includes(process.env.ADMIN_GROUP_NAME || '__NOTHING__')) {
        grants.push("ROLE_ADMIN");
        grants.push("ROLE_EVENT_COORDINATOR");
    } else if (accessToken["cognito:groups"]?.includes(process.env.EVENT_COORDINATOR_GROUP_NAME || '__NOTHING__')) {
        grants.push("ROLE_EVENT_COORDINATOR");
    }

    return {
        username,
        grants
    }
}