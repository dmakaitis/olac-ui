import {handler} from "../../../../lib/functions/resource/event/get-event-reservations"
import {mockClient} from "aws-sdk-client-mock"
import {DynamoDBClient, QueryCommand} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocumentClient} from "@aws-sdk/lib-dynamodb";
import {AttributeValue} from "@aws-sdk/client-dynamodb/dist-types/models/models_0";
import testData from "./get-event-reservations.data.json"

const event = {
    pathParameters: {
        eventId: "my-event-id"
    }
} as any;

const ddbMock = mockClient(DynamoDBClient);
const docMock = mockClient(DynamoDBDocumentClient);

describe("EventResource.get-event-reservations", () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        ddbMock.reset();
        docMock.reset();
        process.env = {
            ...OLD_ENV,
            TABLE_NAME: 'MyTable'
        }
    })

    afterAll(() => {
        process.env = OLD_ENV;
    })

    test("An empty list should be returned if there are no event reservations in the database.", async () => {
        docMock.on(QueryCommand, {
            TableName: process.env.TABLE_NAME,
            IndexName: 'GlobalEventIndex',
            ScanIndexForward: false,
            KeyConditionExpression: "eventId = :idValue",
            ExpressionAttributeValues: {
                ":idValue": { S: event.pathParameters.eventId }
            }
        }).resolves({
            Items: []
        });

        const result = await handler(event);
        expect(result.statusCode).toEqual(200);
        expect(result.body).toStrictEqual(JSON.stringify({
            items: []
        }))
    })

    test("If a small number of events exist in the DB, then they should all be returned.", async () => {
        const Items: Record<string, AttributeValue>[] = testData.queryResult;
        const LastEvaluatedKey: Record<string, AttributeValue> = { key: { S: "value"}};

        docMock.on(QueryCommand, {
            ExclusiveStartKey: undefined
        }).resolves({
            Items,
            LastEvaluatedKey
        });

        const result = await handler(event);
        expect(result.statusCode).toEqual(200);
        expect(result.body).toStrictEqual(JSON.stringify({
            items: testData.expected,
            nextStartKey: Buffer.from(JSON.stringify(LastEvaluatedKey), 'binary').toString('base64url')
        }))
    })

    test("If a starting index is passed in, then it should be used in the query and the next page should be returned.", async () => {
        const Items: Record<string, AttributeValue>[] = testData.queryResult;

        const nextKey = {"index": {S: "my-next-key"}};

        event.queryStringParameters = {
            startKey: Buffer.from(JSON.stringify(nextKey), 'binary').toString('base64url')
        };

        docMock.on(QueryCommand, {ExclusiveStartKey: nextKey}).resolves({
            Items
        });

        const result = await handler(event);
        expect(result.statusCode).toEqual(200);
        expect(result.body).toStrictEqual(JSON.stringify({
            items: testData.expected
        }))
    })
})
