import {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from 'aws-lambda';
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocument} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocument.from(client);

export const handler: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log(`Deleting reservation: ${event.pathParameters?.reservationId}`);

    const response = await docClient.delete({
        TableName: process.env.TABLE_NAME,
        Key: {
            id: event.pathParameters?.reservationId
        }
    });

    console.log(`Response: ${JSON.stringify(response)}`);

    return {
        statusCode: 200,
        body: ""
    };
};
