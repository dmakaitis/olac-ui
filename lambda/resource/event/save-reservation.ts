import {Handler} from 'aws-lambda';
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocument} from "@aws-sdk/lib-dynamodb";

import {Reservation} from "./reservation";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocument.from(client);

export const handler: Handler = async (event) => {
    const body: Reservation = JSON.parse(event.body);

    if (event.httpMethod === "PUT" || isValidEventReservation(body)) {
        const crypto = require("crypto");

        let newEventReservation = {
            id: event.pathParameters?.reservationId || body.id || crypto.randomUUID(),
            eventId: event.pathParameters?.eventId || body.eventId,
            reservationId: body.reservationId,
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            phone: body.phone,
            status: body.status,
            reservationTimestamp: body.reservationTimestamp,
            ticketCounts: body.ticketCounts
                .filter(c => c.costPerTicket > 0)
                .filter(c => c.count > 0),
            payments: body.payments
                .filter(p => p.amount > 0)
        };

        const response = await docClient.put({
            TableName: process.env.TABLE_NAME,
            Item: newEventReservation
        });


        const getResponse = await docClient.get({
            TableName: process.env.TABLE_NAME,
            Key: {
                id: newEventReservation.id
            }
        });

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
