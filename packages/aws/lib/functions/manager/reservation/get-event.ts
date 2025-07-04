import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda";
import {getReservationManager} from "@olac/reservation-manager";

export async function handler(event: APIGatewayProxyEvent, _context: Context): Promise<APIGatewayProxyResult> {
    const eventId = event.pathParameters?.eventId || '';

    const rVal = await getReservationManager().getEvent(eventId);

    if (rVal) {
        return {
            statusCode: 200,
            body: JSON.stringify(rVal),
            headers: {
                'Content-Type': 'application/json',
            }
        }
    } else {
        console.log(`No event exists with id: ${eventId}`);
        return {
            statusCode: 404,
            body: ''
        }
    }
}
