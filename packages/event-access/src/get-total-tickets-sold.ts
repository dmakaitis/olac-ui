import {Reservation} from "@olac/types";
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocument} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocument.from(client);

export async function getTotalTicketsSold(eventId: string): Promise<number> {
    // Read all reserations and count how many tickets we currently have:
    let getReservationsResponse = await docClient.query({
        TableName: process.env.RESERVATION_TABLE_NAME,
        IndexName: "GlobalEventIndex",
        KeyConditionExpression: "eventId = :idValue",
        ExpressionAttributeValues: {
            ":idValue": eventId
        }
    });

    let items: Reservation[] = getReservationsResponse.Items as Reservation[] || [];
    let totalTicketsSold = items.map(r => r.ticketCounts.reduce((a, b) => a + b.count, 0))
        .reduce((a, b) => a + b, 0);

    while (getReservationsResponse.LastEvaluatedKey) {
        getReservationsResponse = await docClient.query({
            TableName: process.env.RESERVATION_TABLE_NAME,
            IndexName: "GlobalEventIndex",
            KeyConditionExpression: "eventId = :idValue",
            ExpressionAttributeValues: {
                ":idValue": eventId
            },
            ExclusiveStartKey: getReservationsResponse.LastEvaluatedKey
        });

        items = getReservationsResponse.Items as Reservation[] || [];
        totalTicketsSold = items.map(r => r.ticketCounts.reduce((a, b) => a + b.count, 0))
            .reduce((a, b) => a + b, totalTicketsSold);
    }

    return totalTicketsSold;
}