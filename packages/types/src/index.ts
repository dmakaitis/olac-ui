export interface TicketTypes {
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
    ticketTypes: TicketTypes[]
}

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

export interface QueryResults<T> {
    items: T[],
    nextStartKey?: string
}
