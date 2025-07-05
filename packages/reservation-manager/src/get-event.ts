import {getEventAccess} from "@olac/event-access";
import {Event} from "@olac/types";

export async function getEvent(eventId: string): Promise<Event | undefined> {
    return getEventAccess().getEvent(eventId);
}
