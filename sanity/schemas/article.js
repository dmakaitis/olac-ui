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
      name: 'subtitle',
      type: 'string',
      title: 'Subtitle'
    },
    {
      name: 'showtitle',
      type: 'boolean',
      title: 'Include title when viewing article',
      initialValue: true
    },
    {
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true
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
      name: 'image',
      type: 'image',
      title: 'Image',
      options: {
        hotspot: true
      }
    },
    {
      name: 'copy',
      type: 'array',
      title: 'Copy',
      of: [
        {type: 'block'},
        {type: 'image'},
        {type: 'floatingimages'},
        {type: 'collection'},
        {type: 'ticketwidget'},
        {type: 'paypaldonation'}
      ]
    }
  ]
}
