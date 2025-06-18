import {defineType, defineField, defineArrayMember} from 'sanity'

export const article = defineType({
    name: 'article',
    type: 'document',
    title: 'Article',
    fields: [
        defineField({
            name: 'title',
            type: 'string',
            title: 'Title',
            validation: (rule) => rule.required()
        }),
        defineField({
            name: 'subtitle',
            type: 'string',
            title: 'Subtitle'
        }),
        defineField({
            name: 'showtitle',
            type: 'boolean',
            title: 'Include title when viewing article',
            initialValue: true
        }),
        defineField({
            name: 'language',
            type: 'string',
            readOnly: true,
            hidden: true
        }),
        defineField({
            name: 'slug',
            type: 'slug',
            title: 'Slug',
            options: {
                source: 'title'
            },
            validation: (rule) => rule.required()
        }),
        defineField({
            name: 'image',
            type: 'image',
            title: 'Image',
            options: {
                hotspot: true
            }
        }),
        defineField({
            name: 'copy',
            type: 'array',
            title: 'Copy',
            of: [
                defineArrayMember({type: 'block'}),
                defineArrayMember({type: 'image'}),
                defineArrayMember({type: 'floatingimages'}),
                defineArrayMember({type: 'collection'}),
                defineArrayMember({type: 'ticketwidget'}),
                defineArrayMember({type: 'paypaldonation'})
            ]
        })
    ]
})
