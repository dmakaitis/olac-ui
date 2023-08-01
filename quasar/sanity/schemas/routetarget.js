import {defineType, defineField, defineArrayMember} from 'sanity'

export const routetarget = defineType({
  name: 'routetarget',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'requiredRole',
      title: 'Required user role to view',
      type: 'string',
      initialValue: '',
      options: {
        list: [
          {title: 'All Users', value: ''},
          {title: 'Event Coordinators', value: 'EVENT_COORDINATOR'},
          {title: 'Administrators', value: 'ADMIN'}
        ]
      }
    }),
    defineField({
      name: 'target',
      title: 'Target',
      type: 'string',
      validation: (rule) => rule.required()
    })
  ]
})
