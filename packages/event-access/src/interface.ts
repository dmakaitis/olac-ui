import {Event} from "@olac/types";

export interface EventAccess {

    /**
     * Returns an event given its ID, if it exists.
     *
     * @param {string} eventId the event ID.
     * @returns {Promise<Event | undefined>} the event, or undefined if it does not exist.
     */
    getEvent(eventId: string): Promise<Event | undefined>;                                                               // GET /api/events/${props.eventId}

    /**
     * Returns the total number of tickets that have been sold for the given event.
     *
     * @param {string} eventId the event ID.
     * @returns {Promise<number>} the number of tickets that have been sold for the event.
     */
    getTotalTicketsSold(eventId: string): Promise<number>;

}
