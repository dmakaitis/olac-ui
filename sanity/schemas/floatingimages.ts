import {defineType, defineField} from 'sanity'

export const floatingimages = defineType({
  name: 'floatingimages',
  title: 'Floating Image (left or right)',
  type: 'object',
  fields: [
    defineField({
      name: 'left',
      title: 'Float on Left',
      description: 'Images will float on the left side if this is enabled. Otherwise, they will float on the right side',
      type: 'boolean',
      validation: (rule) => rule.required(),
      initialValue: true
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {type: 'image'}
      ]
    })
  ],
  preview: {
    select: {
      left: 'left',
      media: 'images.0',
      image0: 'images.0.asset.title',
      image1: 'images.1.asset.title',
      image2: 'images.2.asset.title',
      image3: 'images.3.asset.title'
    },
    prepare: ({left, media, image0, image1, image2, image3}) => {
      const titles = [image0, image1, image2].filter(Boolean)
      const title = titles.length > 0 ? titles.join(',') : ''
      const hasMoreTitles = Boolean(image3)

      return {
        title: hasMoreTitles ? `${title}...` : title,
        subtitle: left ? "Float on left side" : "Float on right side",
        media
      }
    }
  }
})
