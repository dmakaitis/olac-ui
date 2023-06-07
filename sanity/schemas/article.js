export default {
  name: 'article',
  type: 'document',
  title: 'Article',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Title',
      validation: (rule) => rule.required()
    },
    {
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: {
        source: 'title'
      },
      validation: (rule) => rule.required()
    },
    {
      name: 'subtitle',
      type: 'string',
      title: 'Subtitle'
    },
    {
      name: 'imagesOnLeft',
      type: 'boolean',
      title: 'Images on Left Side',
      initialValue: true
    },
    {
      name: 'images',
      type: 'array',
      title: 'Images',
      of: [{
        type: 'image',
        fields: [
          {
            name: 'caption',
            type: 'string',
            title: 'Caption'
          }
        ]
      }]
    },
    {
      name: 'copy',
      type: 'array',
      title: 'Copy',
      of: [{type: 'block'}]
    }
  ]
}
