import {ReservationManager} from "./interface";
import {Event} from "@olac/types";
import {getEvent} from "./get-event";
import {getNewReservationId} from "./get-new-reservation-id";
import {areTicketsAvailable} from "./are-tickets-available";

export function getReservationManager() : ReservationManager {
    return {
        async getEvent(eventId: string): Promise<Event | undefined> {
            return getEvent(eventId);
        },

        getNewReservationId(eventId: string): string {
            return getNewReservationId(eventId);
        },

        async areTicketsAvailable(eventId: string, requestedTicketCount: number): Promise<boolean> {
            return areTicketsAvailable(eventId, requestedTicketCount);
        }
    }
}
