import {routetarget} from "./routetarget";

export default {
  name: 'tabmenu',
  type: 'object',
  fields: [
    {
      name: 'name',
      type: 'string',
      title: 'Name',
      validation: (rule) => rule.required()
    },
    {
      name: 'items',
      type: 'array',
      title: 'Items',
      of: [
        routetarget,
        {
          type: 'reference',
          to: [{
            type: 'article',
          }],
        }
      ]
    }
  ]
}
