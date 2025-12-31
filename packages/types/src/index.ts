//**********************************
// Event related types:
//**********************************

export interface TicketType {
    name: string,
    price: number
}

export interface Event {
    id?: string,
    name: string,
    eventDate: string,
    ticketSaleStartDate?: string,
    ticketSaleEndDate?: string,
    maxTickets?: number,
    ticketTypes: TicketType[]
}

//**********************************
// Event reservation related types:
//**********************************

export interface TicketCount {
    typeName: string,
    costPerTicket: number,
    count: number
}

export interface Payment {
    amount: number,
    status: 'PENDING' | 'SUCCESSFUL' | 'FAILED',
    method: 'ONLINE' | 'CHECK' | 'COMP',
    notes?: string,
    enteredBy?: string,
    createdTimestamp?: string
}

export interface Reservation {
    id?: string,
    eventId: string,
    reservationId?: number,
    firstName: string,
    lastName: string,
    email: string,
    phone?: string,
    status: 'PENDING_PAYMENT' | 'RESERVED' | 'CHECKED_IN' | 'CANCELLED',
    reservationTimestamp?: string,
    ticketCounts: TicketCount[],
    payments: Payment[]
}

//**********************************
// Utility related types
//**********************************

type PayPalConfig = {
    "api-base": string | undefined;
    client: string | undefined;
    donationButtonId: string | undefined;
}

type CognitoConfig = {
    domain: string | undefined;
    clientId: string | undefined;
    redirectUri: string | undefined;
}

type OlacConfig = {
    paypal: PayPalConfig;
    cognito: CognitoConfig;
}

export type ConfigUtilityGetResult = {
    olac: OlacConfig;
}

export type GrantCollection = ('ROLE_ADMIN' | 'ROLE_EVENT_COORDINATOR')[];

export type UserData = {
    username: string;
    grants: GrantCollection;
}

export type JwtToken = {
    token_use: string;
    'cognito:groups'?: string[];
    sub: string;
    iss: string;
    exp: number;
    iat: number;
    auth_time: number;
    jti: string;
    origin_jti?: string;

    client_id: string;
    version: number;
    username: string;
    scope: string;
}

//**********************************
// API related types
//**********************************

export interface QueryResults<T> {
    items: T[],
    nextStartKey?: string
}
