export default {
  name: 'collection',
  type: 'document',
  title: 'Article Collection',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Title'
    },
    {
      name: 'articles',
      type: 'array',
      title: 'Articles',
      of: [{
        type: 'reference',
        to: [{type: 'article'}]
      }]
    }
  ]
}
