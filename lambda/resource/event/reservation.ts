export interface Reservation {
    id?: string,
    eventId: string,
    reservationId: number,
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    status: string,
    reservationTimestamp: string,
    ticketCounts: [{
        typeName: string,
        costPerTicket: number,
        count: number
    }],
    payments: [{
        amount: number,
        status: string,
        method: string,
        notes: string,
        enteredBy: string,
        createdTimestamp: string
    }]
}