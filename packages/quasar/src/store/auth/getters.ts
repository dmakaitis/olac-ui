import {AuthState} from "src/util/types";

export function isLoggedIn(state: AuthState): boolean {
    if (state.jwtToken) {
        return true;
    } else {
        return false;
    }
}

export function authHeader(state: AuthState): string {
    return `Bearer ${state.jwtToken}`
}

export function isAdmin(state: AuthState): boolean {
    return state.grants.includes('ROLE_ADMIN')
}
