import {defineField, defineType} from "sanity";

export const tabbar = defineType({
  name: 'tabbar',
  type: 'document',
  title: 'Tab Bar',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      title: 'Name',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: {
        source: 'name'
      },
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'items',
      type: 'array',
      title: 'Items',
      of: [
        { type: 'routetarget' },
        {
          type: 'reference',
          to: [{
            type: 'article',
          }],
        },
        { type: 'tabmenu' }
      ]
    })
  ]
})
