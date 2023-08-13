import {defineType, defineField, defineArrayMember} from 'sanity'

export const ticketwidget = defineType({
  name: 'ticketwidget',
  title: 'Event Ticket Ordering Widget',
  type: 'object',
  fields: [
    defineField({
      name: 'eventId',
      title: 'Event ID',
      description: 'The event ID from the OLAC event reservation system.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      eventId: 'eventId'
    },
    prepare: ({eventId}) => {
      return {
        title: 'Event Ticket Ordering Widget',
        subtitle: `Event ID: ${eventId}`
      }
    }
  }
})
