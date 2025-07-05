import {ReservationManager} from "./interface";
import {Event} from "@olac/types";
import {getEvent} from "./get-event";

export function getReservationManager() : ReservationManager {
    return {
        async getEvent(eventId: string): Promise<Event | undefined> {
            return getEvent(eventId);
        }
    }
}
