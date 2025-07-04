import {Event} from "@olac/types";
import {getEventAccess} from "@olac/event-access";

// export interface NewReservationRequest {
//     id: string,
//     eventId: string,
//     firstName: string,
//     lastName: string,
//     email: string,
//     phone: string,
//     ticketCounts: TicketCount[],
//     payPalPayment: any,
//     username: string
// }

export interface ReservationManager {

    // was getTicketTypes(eventId: string): TicketType[] | undefined
    getEvent(eventId: string): Promise<Event | undefined>;                                          // GET /api/events/${props.eventId}

    // getNewReservationId(eventId: string): string;                                                   // GET /api/events/${props.eventId}/reservations/_new-id

    // areTicketsAvailable(eventId: string, requestedTicketCount: number): boolean;                    // GET /api/events/${props.eventId}/_available?ticketCount=${total}

    // saveReservation(reservation: NewReservationRequest, sendNotification: boolean): Reservation;     // POST /api/events/${props.eventId}/_newReservation

    // validateAndAddPayment(reservationId: string, paymentProcessorTransactionId: string): boolean;

}

export function getReservationManager() : ReservationManager {
    return {
        async getEvent(eventId: string): Promise<Event | undefined> {
            return getEventAccess().getEvent(eventId);
        }
    }
}
