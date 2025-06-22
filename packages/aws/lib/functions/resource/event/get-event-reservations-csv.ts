import {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from 'aws-lambda';
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocument, QueryCommandInput} from "@aws-sdk/lib-dynamodb";
import {Reservation, Payment} from "@olac/types";
import {json2csv} from "json-2-csv";

interface TicketType {
    typeName: string,
    costPerTicket: number
}

const client = new DynamoDBClient({});
const docClient = DynamoDBDocument.from(client);

export const handler: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const queryCommandInput: QueryCommandInput = {
        TableName: process.env.TABLE_NAME,
        IndexName: "GlobalEventIndex",
        ScanIndexForward: false,
        KeyConditionExpression: "eventId = :idValue",
        ExpressionAttributeValues: {
            ":idValue": event.pathParameters?.eventId
        }
    };

    // Load all the reservations for the event into memory...
    let response = await docClient.query(queryCommandInput);
    let reservations: Reservation[] = response.Items as Reservation[] || [];
    while (response.LastEvaluatedKey) {
        queryCommandInput.ExclusiveStartKey = response.LastEvaluatedKey;
        response = await docClient.query(queryCommandInput);
        reservations = reservations.concat(response.Items as Reservation[] || []);
    }

    // Get all sold ticket types for headers
    const ticketTypeSet = new Set<TicketType>();
    reservations.forEach(r => {
        r.ticketCounts.forEach(t => {
                ticketTypeSet.add({
                    typeName: t.typeName,
                    costPerTicket: t.costPerTicket
                });
            }
        );
    });
    const ticketTypes = Array.from(ticketTypeSet).sort((a, b) => b.costPerTicket - a.costPerTicket);

    // Reformat our output...
    const reservationValues = reservations.flatMap(r => {
        if (r.payments?.length) {
            return r.payments.map(p => {
                return normalizeCsvRow(ticketTypes, r, p);
            })
        } else {
            return [normalizeCsvRow(ticketTypes, r, null)];
        }
    });

    const responseBody = json2csv(reservationValues);

    return {
        statusCode: 200,
        body: responseBody
    };
}

function normalizeCsvRow(ticketTypes: TicketType[], r: Reservation, p: Payment | null): Record<string, any> {
    const normalized: Record<string, any> = {
        "Reservation Number": r.reservationId || 0,
        "Date/Time Reserved": r.reservationTimestamp || '',
        "First Name": r.firstName || '',
        "Last Name": r.lastName || '',
        "Email": r.email || '',
        "Phone": r.phone || '',
        "Status": r.status || '',
    };

    ticketTypes.forEach(t => {
        normalized[t.typeName] = r.ticketCounts
            .filter(c => c.typeName === t.typeName)
            .map(c => c.count)
            .reduce((a, b) => a + b, 0);
    });

    normalized["Total Tickets"] = r.ticketCounts
        .map(c => c.count)
        .reduce((a, b) => a + b, 0);
    normalized["Amount Due"] = r.ticketCounts
        .map(c => c.count * c.costPerTicket)
        .reduce((a, b) => a + b, 0);

    normalized["Payment Method"] = p?.method || '';
    normalized["Payment Received"] = p?.createdTimestamp || '';
    normalized["Payment Status"] = p?.status || '';
    normalized["Payment Amount"] = p?.amount || '';
    normalized["Payment Notes"] = p?.notes || '';

    return normalized;
}