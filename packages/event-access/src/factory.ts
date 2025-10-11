import {EventAccess} from "./interface";
import {Event} from "@olac/types";
import {getEvent} from "./get-event";
import {getTotalTicketsSold} from "./get-total-tickets-sold";

export function getEventAccess() : EventAccess {
    return {
        async getEvent(eventId: string): Promise<Event | undefined> {
            return getEvent(eventId);
        },

        async getTotalTicketsSold(eventId: string): Promise<number> {
            return getTotalTicketsSold(eventId);
        }
    }
}
