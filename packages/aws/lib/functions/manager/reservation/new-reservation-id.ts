import {randomUUID} from "crypto";
import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda";

export async function handler(_event: APIGatewayProxyEvent, _context: Context): Promise<APIGatewayProxyResult> {
    return {
        statusCode: 200,
        body: randomUUID()
    };
}
