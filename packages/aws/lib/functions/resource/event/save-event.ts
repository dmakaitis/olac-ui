import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocument} from "@aws-sdk/lib-dynamodb";
import {randomUUID} from "crypto";

import {Event} from "@olac/types";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocument.from(client);

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const body: Event = JSON.parse(event.body || '{}');

    if (event.httpMethod === "PUT" || isValidEvent(body)) {
        const newEvent = {
            id: event.pathParameters?.eventId || body.id || randomUUID(),
            index: 'EVENT',
            name: body.name,
            eventDate: body.eventDate,
            ticketSaleStartDate: body.ticketSaleStartDate || null,
            ticketSaleEndDate: body.ticketSaleEndDate || null,
            maxTickets: body.maxTickets || null,
            ticketTypes: body.ticketTypes
                .filter(t => t.name)
                .filter(t => t.price > 0)
                .sort((a, b) => b.price - a.price)
        };

        await docClient.put({
            TableName: process.env.TABLE_NAME,
            Item: newEvent
        });

        const getResponse = await docClient.get({
            TableName: process.env.TABLE_NAME,
            Key: {
                id: newEvent.id
            }
        });

        return {
            statusCode: 200,
            body: JSON.stringify(getResponse.Item)
        };
    } else {
        throw("Failed to save event - invalid input");
    }
}

function isUndefinedOrValidDate(eventDate: string | undefined) {
    if (!eventDate) {
        return true;
    }

    return /^-?[\d]+\/[0-1]\d\/[0-3]\d$/.test(eventDate || '');
}

function isValidEvent(event: Event) {
    if (!event.name) {
        return false;
    }

    if (!(event.maxTickets == undefined || event.maxTickets > 0)) {
        return false;
    }

    if (!isUndefinedOrValidDate(event.eventDate)) {
        return false;
    }
    if (!isUndefinedOrValidDate(event.ticketSaleStartDate)) {
        return false;
    }
    if (!isUndefinedOrValidDate(event.ticketSaleEndDate)) {
        return false;
    }

    return true;
}
