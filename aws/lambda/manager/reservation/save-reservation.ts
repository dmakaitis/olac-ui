import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {Reservation, TicketCount} from "./reservation";
import {InvokeCommand, LambdaClient, LogType} from "@aws-sdk/client-lambda";
import {validateAndAddOnlinePayment} from "./payment";

export interface NewReservationRequest {
    id: string,
    eventId: string,
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    ticketCounts: TicketCount[],
    payPalPayment: any,
    username: string
}

export async function apiHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const request = JSON.parse(event.body || "{}");
    request.eventId = event.pathParameters?.eventId || '';
    request.username = event.requestContext.authorizer?.username || 'anonymous';

    const response = await handler(request);

    return {
        statusCode: 200,
        body: JSON.stringify(response)
    };
}

export async function handler(request: NewReservationRequest): Promise<number> {
    console.log(`Creating a new reservation: ${JSON.stringify(request)}`);

    let newReservation: Reservation = {
        id: request.id,
        eventId: request.eventId,
        firstName: request.firstName,
        lastName: request.lastName,
        email: request.email,
        phone: request.phone,
        ticketCounts: request.ticketCounts,
        payments: [],

        status: 'PENDING_PAYMENT'
    };

    newReservation = await validateAndAddOnlinePayment(newReservation, request.payPalPayment.id, request.username);

    newReservation = await saveReservation(newReservation, true, request.username);

    return newReservation.reservationId || 0;
}

export async function saveReservation(reservation: Reservation, sendNotification: boolean, username: string): Promise<Reservation> {
    normalizePaymentsAndStatus(reservation, username);

    // TODO: Determine how to send notifications if requested...
    // Consumer<Reservation> sendReservationFunction = sendNotification ? paymentEngine.getPaymentNotificationFunction(reservation) : r -> {};

    const client = new LambdaClient({region: "us-east-2"})
    const command = new InvokeCommand({
        FunctionName: process.env.SAVE_RESERVATION_FUNCTION,
        Payload: JSON.stringify({
            reservation: reservation,
            username: username
        }),
        LogType: LogType.Tail
    });
    const {Payload} = await client.send(command);

    const savedReservation: Reservation = JSON.parse(Buffer.from(Payload || "{}").toString());

    // TODO: Send the notification using the method acquired above
    // sendReservationFunction.accept(savedReservation);

    return savedReservation;
}

export function normalizePaymentsAndStatus(reservation: Reservation, username: string): void {
    // Insert username and received timestamp for any new payments...
    reservation.payments.forEach(p => {
        p.enteredBy = p.enteredBy || username;
        p.createdTimestamp = p.createdTimestamp || new Date().toJSON();
    });

    // Update status, if needed
    if (reservation.status === 'PENDING_PAYMENT' || reservation.status === 'RESERVED') {
        let amountPaid = reservation.payments
            .filter(p => p.status === 'SUCCESSFUL')
            .map(p => p.amount)
            .reduce((a, b) => a + b, 0);

        let amountDue = reservation.ticketCounts
            .map(t => t.count * t.costPerTicket)
            .reduce((a, b) => a + b, 0);

        if (amountPaid >= amountDue) {
            reservation.status = 'RESERVED';
        } else {
            reservation.status = 'PENDING_PAYMENT';
        }
    }
}
