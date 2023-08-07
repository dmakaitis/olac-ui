import {Handler} from 'aws-lambda';
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocument, QueryCommandInput} from "@aws-sdk/lib-dynamodb";

interface ResponseBody {
    items?: Record<string, any>[],
    nextStartKey?: string
}

const client = new DynamoDBClient({});
const docClient = DynamoDBDocument.from(client);

export const handler: Handler = async (event) => {
    let pageSize: number = 5;
    if (event.queryStringParameters && event.queryStringParameters.pageSize) {
        pageSize = parseInt(event.queryStringParameters.pageSize);
    }

    let queryCommandInput: QueryCommandInput = {
        TableName: process.env.TABLE_NAME,
        IndexName: "GlobalSortByEventDateIndex",
        ScanIndexForward: false,
        KeyConditionExpression: "#index = :indexValue",
        ExpressionAttributeValues: {
            ":indexValue": "EVENT"
        },
        ExpressionAttributeNames: {
            "#index": "index"
        },
        Limit: pageSize
    };

    if (event.queryStringParameters && event.queryStringParameters.startKey) {
        queryCommandInput.ExclusiveStartKey = JSON.parse(Buffer.from(event.queryStringParameters.startKey, "base64").toString('binary'));
    }

    const response = await docClient.query(queryCommandInput);

    let responseBody: ResponseBody = {
        items: response.Items,
    };

    if (response.LastEvaluatedKey) {
        responseBody.nextStartKey = Buffer.from(JSON.stringify(response.LastEvaluatedKey), 'binary').toString('base64url');
    }

    return {
        statusCode: "200",
        body: JSON.stringify(responseBody)
    };
};
