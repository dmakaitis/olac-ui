import {UserData, JwtToken} from "@olac/types";

export interface SecurityUtility {

    getCurrentUser(accessToken: JwtToken): UserData;

}