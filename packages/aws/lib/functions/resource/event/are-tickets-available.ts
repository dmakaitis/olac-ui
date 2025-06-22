import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocument} from "@aws-sdk/lib-dynamodb";
import {Reservation} from "@olac/types";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocument.from(client);

interface Request {
    eventId: string,
    requestedTicketCount: number
}

export async function apiHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const request : Request = {
        eventId: event.pathParameters?.eventId || '',
        requestedTicketCount: +(event.queryStringParameters?.ticketCount || '0')
    };

    const rVal = await processRequest(request);

    return {
        statusCode: 200,
        body: `${JSON.stringify(rVal)}`
    };
}

async function processRequest(request: Request) : Promise<boolean> {
    // Get the number of available tickets from the events table...
    const getEventResponse = await docClient.get({
        TableName: process.env.EVENT_TABLE_NAME,
        Key: {
            id: request.eventId
        }
    })

    if(!getEventResponse.Item) {
        console.log(`Event does not exist, so no tickets available`);
        return false;
    }

    const maxTickets = getEventResponse.Item?.maxTickets || 0;

    if (!maxTickets) {
        // Event has unlimited tickets, so we're done...
        return true;
    }

    // Read all reserations and count how many tickets we currently have:
    const totalTicketsSold = await getTotalTicketsSold(request.eventId);

    return totalTicketsSold + request.requestedTicketCount <= maxTickets;
}

/**
 * Returns the total number of tickets sold for the event.
 *
 * @param eventId the event ID.
 */
async function getTotalTicketsSold(eventId: string): Promise<number> {
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