import {SecurityUtility} from "./interface";
import {getCurrentUser} from "./get-current-user";
import {JwtToken, UserData} from "@olac/types";

export function getSecurityUtility() : SecurityUtility {
    return {
        getCurrentUser(accessToken: JwtToken): UserData {
            return getCurrentUser(accessToken);
        }
    }
}
