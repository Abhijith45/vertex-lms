import { type SchemaTypeDefinition } from 'sanity'
import { course } from './course'
import { moduleType } from './module'
import { lesson } from './lesson'
import { instructor } from './instructor'
import { category } from './category'
import { video } from './video'
import { agentContext } from './agentContext'
import { progress } from './progress'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    course,
    moduleType,
    lesson,
    instructor,
    category,
    video,
    agentContext,
    progress,
  ],
}
