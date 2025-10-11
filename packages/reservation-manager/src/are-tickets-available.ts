import {getEventAccess} from "@olac/event-access";

const eventAccess = getEventAccess();

export async function areTicketsAvailable(eventId: string, requestedTicketCount: number): Promise<boolean> {
    const event = await eventAccess.getEvent(eventId);
    const maxTickets = event?.maxTickets || 0;

    if (!maxTickets) {
        // Event has unlimited tickets, so we're done...
        return true;
    }

    // Read all reservations and count how many tickets we currently have:
    const totalTicketsSold = await eventAccess.getTotalTicketsSold(eventId);

    return totalTicketsSold + requestedTicketCount <= maxTickets;
}
