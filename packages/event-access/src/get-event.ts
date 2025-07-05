import {Event} from "@olac/types";
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocumentClient, GetCommand} from "@aws-sdk/lib-dynamodb";

export async function getEvent(eventId: string): Promise<Event | undefined> {
    const client = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(client);

    const command = new GetCommand({
        TableName: process.env.EVENT_TABLE_NAME,
        Key: {
            id: eventId
        }
    });

    const response = await docClient.send(command);
    const item = response.Item;

    if (item) {
        // Strip out any extra fields that DynamoDB might have included in the item...
        return {
            eventDate: item.eventDate,
            id: item.id,
            maxTickets: item.maxTickets,
            name: item.name,
            ticketSaleEndDate: item.ticketSaleEndDate,
            ticketSaleStartDate: item.ticketSaleStartDate,
            ticketTypes: item.ticketTypes
        }
    } else {
        return undefined;
    }
}
