export interface Event {
    id?: string,
    name: string,
    eventDate: string,
    ticketSaleStartDate?: string,
    ticketSaleEndDate?: string,
    maxTickets?: number,
    ticketTypes: [{
        name: string,
        price: number
    }]
}

export interface QueryResults<T> {
    items: T[],
    nextStartKey?: string
}
