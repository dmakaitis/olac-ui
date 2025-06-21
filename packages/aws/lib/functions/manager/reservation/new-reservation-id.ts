import {randomUUID} from "crypto";

export async function handler(_event: any, _context: any): Promise<any> {
    return {
        statusCode: 200,
        body: randomUUID()
    };
}
