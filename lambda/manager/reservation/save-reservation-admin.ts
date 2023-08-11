import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {saveReservation} from "./save-reservation";
import {Reservation} from "./reservation";
import crypto from "crypto";

interface SaveReservationAdminRequest {
    reservation: Reservation,
    username: string
}

export async function apiHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const body: Reservation = JSON.parse(event.body || '{}');

    let ticketCounts = body.ticketCounts || [];
    let payments = body.payments || [];

    const request: SaveReservationAdminRequest = {
        reservation: body,
        username: event.requestContext.authorizer?.username || 'anonymous'
    }

    request.reservation.id = event.pathParameters?.reservationId || body.id || crypto.randomUUID();
    request.reservation.eventId = event.pathParameters?.eventId || body.eventId;

    const response = await handler(request);

    return {
        statusCode: 200,
        body: JSON.stringify(response)
    };
}

async function handler(event: SaveReservationAdminRequest): Promise<Reservation> {
    return await saveReservationAdmin(event.reservation, event.username);
}

async function saveReservationAdmin(reservation: Reservation, username: string): Promise<Reservation> {
    // TODO: Add validation of security access and limited functionality for event coordinators
    // if (securityUtility.isCurrentUserAdmin()) {
    //     return saveReservation(reservation, true);
    return await saveReservation(reservation, true, username);
    // }
    //
    // // If the user is not an admin, they can only save the full reservation if it doesn't already exist
    // Optional<Reservation> oldReservationOptional = reservationDatastoreAccess.getReservation(reservation.getReservationId());
    // if (oldReservationOptional.isEmpty()) {
    //     return saveReservation(reservation, true);
    // }
    //
    // // Non administrators can only add new payments...
    // Reservation oldReservation = oldReservationOptional.get();
    // List<Payment> payments = new ArrayList<>(oldReservation.getPayments());
    // int startPaymentsSize = payments.size();
    // reservation.getPayments().stream()
    //     .filter(p -> p.getId() == null)
    //     .forEach(payments::add);
    //
    // if (startPaymentsSize != payments.size()) {
    //     oldReservation.setPayments(payments);
    //     return saveReservation(oldReservation, true);
    // }
    //
    // return oldReservation;
}