import { defineType, defineField, defineArrayMember } from 'sanity'

export const video = defineType({
  name: 'video',
  title: 'Video Intelligence',
  type: 'document',
  fields: [
    defineField({
      name: 'videoId',
      title: 'Video ID',
      type: 'string',
      description: 'Derived from the unique video URL',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'Video URL',
      type: 'url',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'chapters',
      title: 'Table of Contents (Chapters)',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'chapter',
          fields: [
            defineField({ name: 'startSeconds', title: 'Start Seconds', type: 'number', validation: (Rule) => Rule.required() }),
            defineField({ name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'chunks',
      title: 'Transcript Chunks',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'chunk',
          fields: [
            defineField({ name: 'startSeconds', title: 'Start Seconds', type: 'number', validation: (Rule) => Rule.required() }),
            defineField({ name: 'text', title: 'Text', type: 'text', validation: (Rule) => Rule.required() }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'videoId',
      subtitle: 'url',
    },
  },
})
