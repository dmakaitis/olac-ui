import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {getReservationManager} from "@olac/reservation-manager";

const reservationManager = getReservationManager();

export async function apiHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const eventId = event.pathParameters?.eventId || '';
    const requestedTicketCount = +(event.queryStringParameters?.ticketCount || '0');

    const rVal = await reservationManager.areTicketsAvailable(eventId, requestedTicketCount);

    return {
        statusCode: 200,
        body: `${JSON.stringify(rVal)}`
    };
}
