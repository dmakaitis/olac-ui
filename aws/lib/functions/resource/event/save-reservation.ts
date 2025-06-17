import {Handler} from 'aws-lambda';
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocument} from "@aws-sdk/lib-dynamodb";

import {Reservation} from "./reservation";

import * as crypto from "crypto";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocument.from(client);

interface SaveReservationRequest {
    reservation: Reservation,
    username: string
}

interface AuditEvent {
    id: string,
    reservationId: string,
    timestamp: string,
    user: string,
    note: string
}

export const apiHandler: Handler = async (event) => {
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

export async function handler(request: SaveReservationRequest): Promise<Reservation> {
    const reservation = request.reservation;

    // If we don't have a reservation timestamp, set it now...
    if (!reservation.reservationTimestamp) {
        reservation.reservationTimestamp = new Date().toJSON();
    }

    // If we don't have an ID value, set it now...
    if (!reservation.reservationId) {
        reservation.reservationId = await getNewReservationId();
    }

    let newReservation = true;

    if (reservation.id) {
        const getResponse = await docClient.get({
            TableName: process.env.TABLE_NAME,
            Key: {
                id: reservation.id
            }
        });

        if (getResponse.Item) {
            await logChangesToReservation(<Reservation>getResponse.Item, reservation, request.username);
            newReservation = false;
        }
    }

    if (newReservation) {
        await logReservationEvent(reservation?.id || 'unknown', `Saving new reservation for ${reservation.firstName} ${reservation.lastName}`, request.username);
    }

    docClient.put({
        TableName: process.env.TABLE_NAME,
        Item: reservation
    });

    return reservation;
}

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

        if (amountPaid >= amountDue) {
            reservation.status = 'RESERVED';
        } else {
            reservation.status = 'PENDING_PAYMENT';
        }
    }
}

async function logChangesToReservation(original: Reservation, updated: Reservation, username: string) {
    if(original.reservationId !== updated.reservationId) {
        await logReservationEvent(<string>original.id, `Updated reservation ID: ${original.reservationId} => ${updated.reservationId}`, username);
    }
    if(original.firstName !== updated.firstName) {
        await logReservationEvent(<string>original.id, `Updated first name: ${original.firstName} => ${updated.firstName}`, username);
    }
    if(original.lastName !== updated.lastName) {
        await logReservationEvent(<string>original.id, `Updated last name: ${original.lastName} => ${updated.lastName}`, username);
    }
    if(original.email !== updated.email) {
        await logReservationEvent(<string>original.id, `Updated email: ${original.email} => ${updated.email}`, username);
    }
    if(original.phone !== updated.phone) {
        await logReservationEvent(<string>original.id, `Updated phone: ${original.phone} => ${updated.phone}`, username);
    }
    if(original.status !== updated.status) {
        await logReservationEvent(<string>original.id, `Updated status: ${original.status} => ${updated.status}`, username);
    }

    // TODO: Fix object comparisons so this is accurate...
    // if(original.ticketCounts !== updated.ticketCounts) {
    //     await logReservationEvent(<string>original.id, `Updated ticket counts: ${JSON.stringify(original.ticketCounts)} => ${JSON.stringify(updated.ticketCounts)}`, username);
    // }
    // if(original.payments !== updated.payments) {
    //     await logReservationEvent(<string>original.id, `Updated payments: ${JSON.stringify(original.payments)} => ${JSON.stringify(updated.payments)}`, username);
    // }

    // Temporary solution (though this is probably good enough):
    const originalTicketCounts = original.ticketCounts.map(t => t.count).reduce((a, b) => a + b, 0);
    const updatedTicketCounts = updated.ticketCounts.map(t => t.count).reduce((a, b) => a + b, 0);
    if(originalTicketCounts !== updatedTicketCounts) {
        await logReservationEvent(<string>original.id, `Updated total ticket counts: ${originalTicketCounts} => ${updatedTicketCounts}`, username);
    }

    const originalAmountDue = original.ticketCounts.map(t => t.count * t.costPerTicket).reduce((a, b) => a + b, 0);
    const updatedAmountDue = updated.ticketCounts.map(t => t.count * t.costPerTicket).reduce((a, b) => a + b, 0);
    if(originalAmountDue !== updatedAmountDue) {
        await logReservationEvent(<string>original.id, `Updated total amount due: ${originalAmountDue} => ${updatedAmountDue}`, username);
    }

    const originalPayments = original.payments.map(p => p.amount).reduce((a, b) => a + b, 0);
    const updatedPayments = updated.payments.map(p => p.amount).reduce((a, b) => a + b, 0);
    if(originalPayments !== updatedPayments) {
        await logReservationEvent(<string>original.id, `Updated total payments: ${originalPayments} => ${updatedPayments}`, username);
    }
}

async function logReservationEvent(reservationId: string, note: string, username: string) {
    const auditLog: AuditEvent = {
        id: crypto.randomUUID().toString(),
        reservationId: reservationId,
        timestamp: new Date().toJSON(),
        user: username,
        note: note
    };

    await docClient.put({
        TableName: process.env.AUDIT_TABLE_NAME,
        Item: auditLog
    })
}