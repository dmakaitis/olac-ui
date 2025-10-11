import {ReservationManager} from "./interface";
import {Event} from "@olac/types";
import {getEvent} from "./get-event";
import {getNewReservationId} from "./get-new-reservation-id";

export function getReservationManager() : ReservationManager {
    return {
        async getEvent(eventId: string): Promise<Event | undefined> {
            return getEvent(eventId);
        },

        getNewReservationId(eventId: string): string {
            return getNewReservationId(eventId);
        }
    }
}
