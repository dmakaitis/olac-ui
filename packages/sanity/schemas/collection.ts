import {defineType, defineField} from 'sanity'

export const collection = defineType({
  name: 'collection',
  title: 'Collection of Articles',
  type: 'object',
  fields: [
    defineField({
      name: 'articles',
      type: 'array',
      title: 'Articles',
      of: [{
        type: 'reference',
        to: [{type: 'article'}]
      }]
    })
  ],
  preview: {
    select: {
      title0: 'articles.0.title',
      title1: 'articles.1.title',
      title2: 'articles.2.title'
    },
    prepare: ({title0, title1, title2}) => {
      const titles = [title0, title1].filter(Boolean)
      const subtitle = titles.length > 0 ? titles.join(', ') : ''
      const hasMore = Boolean(title2)

      return {
        title: `Articles:`,
        subtitle: hasMore ? `${subtitle}...` : subtitle
      }
    }
  }
})
