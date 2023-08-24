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

export interface ClientConfig {
    paypal: {
        apiBase: string,
        clientId: string,
        donationButtonId: string
    },
    cognito: {
        domain: string,
        clientId: string,
        redirectUri: string
    },
    showLogin: boolean
}
