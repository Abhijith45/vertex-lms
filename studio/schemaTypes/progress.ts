import { defineType, defineField, defineArrayMember } from 'sanity'

export const progress = defineType({
  name: 'progress',
  title: 'Learner Progress',
  type: 'document',
  fields: [
    defineField({
      name: 'clerkUserId',
      title: 'Clerk User ID',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'completedLessons',
      title: 'Completed Lessons',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'lesson' }],
        }),
      ],
    }),
    defineField({
      name: 'resumePositions',
      title: 'Resume Positions',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'position',
          fields: [
            defineField({ name: 'lesson', title: 'Lesson', type: 'reference', to: [{ type: 'lesson' }], validation: (Rule) => Rule.required() }),
            defineField({ name: 'positionSeconds', title: 'Position (Seconds)', type: 'number', validation: (Rule) => Rule.required() }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'bookmarkedCourses',
      title: 'Bookmarked Courses',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'course' }],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'clerkUserId',
    },
  },
})
