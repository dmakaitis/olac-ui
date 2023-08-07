import {Handler} from 'aws-lambda';
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocument} from "@aws-sdk/lib-dynamodb";

import {Event} from "./event";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocument.from(client);

export const handler: Handler = async (event) => {
    console.log(`Request: ${JSON.stringify(event)}`);

    const body: Event = JSON.parse(event.body);
    console.log(`Request body: ${JSON.stringify(body)}`);

    if (isValidEvent(body)) {
        const crypto = require("crypto");

        let newEvent = {
            id: body.id || crypto.randomUUID(),
            index: 'EVENT',
            name: body.name,
            eventDate: body.eventDate,
            ticketSaleStartDate: body.ticketSaleStartDate,
            ticketSaleEndDate: body.ticketSaleEndDate,
            maxTickets: body.maxTickets,
            ticketTypes: body.ticketTypes
                .filter(t => t.name)
                .filter(t => t.price > 0)
                .sort((a, b) => b.price - a.price)
        };

        const response = await docClient.put({
            TableName: process.env.TABLE_NAME,
            Item: newEvent
        });

        console.log(response);

        const getResponse = await docClient.get({
            TableName: process.env.TABLE_NAME,
            Key: {
                id: newEvent.id
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

function isUndefinedOrValidDate(eventDate: string | undefined) {
    if (eventDate == undefined) {
        return true;
    }

    // TODO: Add valid date string check here
    return true;
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
