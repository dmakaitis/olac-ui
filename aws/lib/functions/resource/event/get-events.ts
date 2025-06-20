import {DynamoDBClient, QueryCommand} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocumentClient, QueryCommandInput} from "@aws-sdk/lib-dynamodb";
import {APIGatewayEvent, ProxyResult} from "aws-lambda";
import {unmarshall} from "@aws-sdk/util-dynamodb";

interface ResponseBody {
    items?: Record<string, any>[],
    nextStartKey?: string
}

export async function handler(event: APIGatewayEvent):Promise<ProxyResult> {
    const client = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(client);

    const queryCommandInput: QueryCommandInput = {
        TableName: process.env.TABLE_NAME,
        IndexName: "GlobalSortByEventDateIndex",
        ScanIndexForward: false,
        KeyConditionExpression: "#index = :indexValue",
        ExpressionAttributeValues: {
            ":indexValue": { S: "EVENT" }
        },
        ExpressionAttributeNames: {
            "#index": "index"
        }
    };

    if (event.queryStringParameters?.startKey) {
        queryCommandInput.ExclusiveStartKey = JSON.parse(Buffer.from(event.queryStringParameters.startKey, "base64").toString('binary'));
    }

    const command = new QueryCommand(queryCommandInput);
    const response = await docClient.send(command);
    const items = response.Items || [];

    const responseBody: ResponseBody = {
        items: items.map((item) => {
            return unmarshall(item)
        }),
    };

    if (response.LastEvaluatedKey) {
        responseBody.nextStartKey = Buffer.from(JSON.stringify(response.LastEvaluatedKey), 'binary').toString('base64url');
    }

    return {
        statusCode: 200,
        body: JSON.stringify(responseBody)
    };
}
