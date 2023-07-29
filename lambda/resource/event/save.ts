import { Handler } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

import {Event} from "./event";

interface SaveEvent {
    event: Event
}

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler : Handler = async (event: SaveEvent, context) => {
    console.log("EVENT: \n" + JSON.stringify(event, null, 2));

    const crypto = require("crypto");

    let newEvent = {
        id: event.event.id || crypto.randomUUID(),
        index: 'EVENT',
        eventDate: event.event.eventDate,
        name: event.event.name
    };

    const response = await docClient.send(
        new PutCommand({
            TableName: process.env.TABLE_NAME,
            Item: newEvent
        })
    );

    console.log(response);

    return response;
};
