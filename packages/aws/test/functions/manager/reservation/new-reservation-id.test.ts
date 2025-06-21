import {handler} from "../../../../lib/functions/manager/reservation/new-reservation-id"
import {Context} from "aws-lambda";

const event = {} as any;
const context = {} as any as Context;

describe("ReservationManager.new-reservation-id", () => {
    test("The new reservation ID must be a UUID", async () => {
        const result = await handler(event, context);

        expect(result.body).toMatch(/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/);
    })

    test("Each reservation ID must be unique", async () => {
        const results = [
            await handler(event, context),
            await handler(event, context),
            await handler(event, context),
            await handler(event, context),
            await handler(event, context),
            await handler(event, context),
            await handler(event, context),
            await handler(event, context),
            await handler(event, context),
            await handler(event, context)
        ];

        const count = results.length;

        for(let i = 0; i < count - 1; i++) {
            for(let j = i + 1; j < count; j++) {
                expect(results[i].body).not.toEqual(results[j].body)
            }
        }
    })
})
