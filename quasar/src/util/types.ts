export interface OIDCResponse {
    "access_token": string,
    "token_type": "Bearer",
    "id_token": string,
    "expires_in"?: string,
    "refresh_token"?: string
}

export interface WhoAmIResponse {
    username: string,
    grants: ("ROLE_ADMIN" | "ROLE_EVENT_COORDINATOR")[]
}
