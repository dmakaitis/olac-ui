import {routetarget} from "./routetarget";
import tabmenu from "./tabmenu";

export default {
  name: 'tabbar',
  type: 'document',
  title: 'Tab Bar',
  fields: [
    {
      name: 'name',
      type: 'string',
      title: 'Name',
      validation: (rule) => rule.required()
    },
    {
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: {
        source: 'name'
      },
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
        },
        tabmenu
      ]
    }
  ]
}
