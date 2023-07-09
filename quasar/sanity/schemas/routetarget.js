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
      name: 'target',
      title: 'Target',
      type: 'string',
      validation: (rule) => rule.required()
    })
  ]
})
