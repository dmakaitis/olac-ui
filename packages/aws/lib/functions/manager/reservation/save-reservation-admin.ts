import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {saveReservation} from "./save-reservation";
import {Reservation} from "./reservation";
import {v4 as uuidv4} from "uuid";

interface SaveReservationAdminRequest {
    reservation: Reservation,
    username: string,
    grants: string[]
}

export async function apiHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const body: Reservation = JSON.parse(event.body || '{}');

    const request: SaveReservationAdminRequest = {
        reservation: body,
        username: event.requestContext.authorizer?.username || 'anonymous',
        grants: (event.requestContext.authorizer?.grants || '').split(" ")
    }

    request.reservation.id = event.pathParameters?.reservationId || body.id || uuidv4();
    request.reservation.eventId = event.pathParameters?.eventId || body.eventId;

    const response = await handler(request);

    return {
        statusCode: 200,
        body: JSON.stringify(response)
    };
}

async function handler(event: SaveReservationAdminRequest): Promise<Reservation> {
    return await saveReservationAdmin(event.reservation, event.username, event.grants);
}

async function saveReservationAdmin(reservation: Reservation, username: string, _grants: string[]): Promise<Reservation> {
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