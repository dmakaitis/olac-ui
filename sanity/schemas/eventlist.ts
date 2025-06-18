import {defineType, defineField} from 'sanity'

export const eventlist = defineType({
    name: 'eventlist',
    title: 'List of Events',
    type: 'object',
    fields: [
        defineField({
            name: 'future',
            type: 'boolean',
            title: 'Turn on to show events from the future. Otherwise, past events will be shown.',
            initialValue: true
        })
    ],
    preview: {
        select: {
            future: 'future',
        },
        prepare: ({future}) => {
            const title = future ? "Future Events" : "Past Events";

            return {
                title: title
            }
        }
    }
})
