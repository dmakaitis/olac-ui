import {defineField, defineType} from "sanity";

export const tabmenu = defineType({
    name: 'tabmenu',
    type: 'object',
    fields: [
        defineField({
            name: 'name',
            type: 'string',
            title: 'Name',
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
            name: 'items',
            type: 'array',
            title: 'Items',
            of: [
                {type: 'routetarget'},
                {
                    type: 'reference',
                    to: [{
                        type: 'article',
                    }],
                }
            ]
        })
    ]
})
