import {randomUUID} from "crypto";

export function getNewReservationId(_eventId: string): string {
    return randomUUID();
}
