import { defineType, defineField } from 'sanity'

export const agentContext = defineType({
  name: 'agentContext',
  title: 'Agent Context Config',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Vertex Search Configuration',
      readOnly: true,
    }),
    defineField({
      name: 'contentScopeFilter',
      title: 'Content Scope Filter',
      type: 'string',
      description: 'GROQ filter to limit the visible types (e.g. _type in ["course", "lesson", "video", "instructor"])',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'instructions',
      title: 'Search Agent Instructions',
      type: 'text',
      description: 'System instructions for the search agent query logic.',
      validation: (Rule) => Rule.required(),
    }),
  ],
})
