import {Handler} from 'aws-lambda';
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocument} from "@aws-sdk/lib-dynamodb";

import {Reservation} from "./reservation";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocument.from(client);

export const handler: Handler = async (event) => {
    console.log(`Save event: ${JSON.stringify(event)}`);

    const body: Reservation = JSON.parse(event.body);

    let ticketCounts = body.ticketCounts || [];
    let payments = body.payments || [];

    if (event.httpMethod === "PUT" || isValidEventReservation(body)) {
        const crypto = require("crypto");

        let newEventReservation = {
            id: event.pathParameters?.reservationId || body.id || crypto.randomUUID(),
            eventId: event.pathParameters?.eventId || body.eventId,
            reservationId: body.reservationId || await getNewReservationId(),
            firstName: body.firstName || null,
            lastName: body.lastName || null,
            email: body.email || null,
            phone: body.phone || null,
            status: body.status || 'PENDING_PAYMENT',
            reservationTimestamp: body.reservationTimestamp || new Date().toJSON(),
            ticketCounts: ticketCounts
                .filter(c => c.costPerTicket > 0)
                .filter(c => c.count > 0),
            payments: payments
                .filter(p => p.amount > 0)
        };

        updateStatus(newEventReservation, event?.requestContext?.authorizer?.username || 'anonymous');

        console.log(`Saving new reservation: ${JSON.stringify(newEventReservation, (k, v) => v === undefined ? "~~~UNDEFINED~~~" : v)}`);

        const response = await docClient.put({
            TableName: process.env.TABLE_NAME,
            Item: newEventReservation,
            ReturnValues: "ALL_OLD"
        });

        console.log(`Put response: ${JSON.stringify(response)}`);

        const getResponse = await docClient.get({
            TableName: process.env.TABLE_NAME,
            Key: {
                id: newEventReservation.id
            }
        });

        console.log(`Get response: ${JSON.stringify(response)}`);

        return {
            statusCode: "200",
            body: JSON.stringify(getResponse.Item)
        };
    } else {
        throw("Failed to save event - invalid input");
    }
};

function isValidEventReservation(reservation: Reservation) {
    return true;
}

async function getNewReservationId(): Promise<number> {
    const response = await docClient.update({
        TableName: process.env.COUNTER_TABLE_NAME,
        Key: {
            id: 'RESERVATION_ID',
        },
        ExpressionAttributeValues: {
            ":init": 500,
            ":val": 1
        },
        UpdateExpression: "SET sequence_number = if_not_exists(sequence_number, :init) + :val",
        ReturnValues: "UPDATED_NEW"
    });

    return response.Attributes?.sequence_number;
}

function updateStatus(reservation: Reservation, username: string) {
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

        if(amountPaid >= amountDue) {
            reservation.status = 'RESERVED';
        } else {
            reservation.status = 'PENDING_PAYMENT';
        }
    }
}