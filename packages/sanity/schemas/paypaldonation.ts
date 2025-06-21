import {defineField, defineType} from "sanity";

export const paypaldonation = defineType({
  name: 'paypaldonation',
  type: 'object',
  fields: [
    defineField({
      name: 'size',
      title: 'Large Donation Button',
      description: 'If enabled, the large donation button will be used',
      type: 'boolean',
      validation: (rule) => rule.required(),
      initialValue: true
    })
  ],
  preview: {
    select: {
      size: 'size'
    },
    prepare: ({size}) => {
      const sizeStr = size ? 'Large' : 'Small';

      return {
        title: `PayPal Donation Button:`,
        subtitle:`Size: ${sizeStr}`
      }
    }
  }
});
