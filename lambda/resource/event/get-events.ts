import {Handler} from 'aws-lambda';
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocument} from "@aws-sdk/lib-dynamodb";

import {Event} from "./event";

interface SaveEvent {
    event: Event
}

const client = new DynamoDBClient({});
const docClient = DynamoDBDocument.from(client);

export const handler: Handler = async (event: SaveEvent, context) => {
        const response = await docClient.query({
            TableName: process.env.TABLE_NAME,
            IndexName: "GlobalSortByEventDateIndex",
            ScanIndexForward: false,
            KeyConditionExpression: "#index = :indexValue",
            ExpressionAttributeValues: {
                ":indexValue": "EVENT"
            },
            ExpressionAttributeNames: {
                "#index": "index"
            }
        });

        return {
            statusCode: "200",
            body: JSON.stringify(response.Items)
        };
};
