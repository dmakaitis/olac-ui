import {Event} from "@olac/types";

export interface ReservationManager {

    /**
     * Returns an event given its ID, if it exists.
     *
     * @param {string} eventId the event ID.
     * @returns {Promise<Event | undefined>} the event, or undefined if it does not exist.
     */
    getEvent(eventId: string): Promise<Event | undefined>;                                          // GET /api/events/${props.eventId}

    /**
     * Returns a new and unique reservation ID for the given event.
     *
     * @param eventId the event ID for which to create the reservation ID.
     */
    getNewReservationId(eventId: string): string;                                                   // GET /api/events/${props.eventId}/reservations/_new-id

    // areTicketsAvailable(eventId: string, requestedTicketCount: number): boolean;                    // GET /api/events/${props.eventId}/_available?ticketCount=${total}

    // saveReservation(reservation: NewReservationRequest, sendNotification: boolean): Reservation;     // POST /api/events/${props.eventId}/_newReservation

    // validateAndAddPayment(reservationId: string, paymentProcessorTransactionId: string): boolean;

}
