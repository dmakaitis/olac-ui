import {getReservationManager} from "@olac/reservation-manager";
import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda";

export async function handler(event: APIGatewayProxyEvent, _context: Context): Promise<APIGatewayProxyResult> {
    const eventId = event.pathParameters?.eventId || '';
    const reservationId = getReservationManager().getNewReservationId(eventId);

    return {
        statusCode: 200,
        body: reservationId
    };
}
