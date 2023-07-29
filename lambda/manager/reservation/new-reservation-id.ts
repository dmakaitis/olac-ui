import {Handler} from 'aws-lambda';

export const handler: Handler = async (event, context) => {
    const crypto = require("crypto");

    return {
        statusCode: 200,
        body: crypto.randomUUID()
    };
}
