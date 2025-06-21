//********************************************************************
// TODO: Look at the /quasar/src/types/index.ts file for what looks
// to be the intended type definitions and eventually move them here.
//********************************************************************

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

export interface QueryResults<T> {
    items: T[],
    nextStartKey?: string
}
