import {Handler} from "aws-lambda";

export const handler: Handler = async (event, context) => {
    return {
        statusCode: "200",
        body: JSON.stringify({
            "event": event,
            "context": context
        })
    };
}
