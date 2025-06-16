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
