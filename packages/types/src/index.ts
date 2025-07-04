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

//**********************************
// API related types
//**********************************

export interface QueryResults<T> {
    items: T[],
    nextStartKey?: string
}
