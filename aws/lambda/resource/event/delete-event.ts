import {Handler} from 'aws-lambda';
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocument} from "@aws-sdk/lib-dynamodb";

import {Event} from "./event";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocument.from(client);

export const handler: Handler = async (event) => {
    console.log(`Deleting event: ${event.pathParameters.eventId}`);

    const response = await docClient.delete({
        TableName: process.env.TABLE_NAME,
        Key: {
            id: event.pathParameters.eventId
        }
    });

    console.log(`Response: ${JSON.stringify(response)}`);

    return {
        statusCode: "200"
    };
};
