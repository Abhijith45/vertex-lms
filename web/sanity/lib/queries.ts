import { defineQuery } from 'next-sanity'

export const getCoursesQuery = defineQuery(`
  *[_type == "course"] | order(_createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    summary,
    coverImage,
    level,
    price,
    popular,
    studentCount,
    "modulesCount": count(modules),
    modules[]{
      title,
      summary,
      lessons[]->{
        _id,
        duration
      }
    },
    instructor->{
      name,
      "slug": slug.current,
      photo,
      expertise
    },
    category->{
      title,
      "slug": slug.current
    }
  }
`)

export const getCategoriesQuery = defineQuery(`
  *[_type == "category"] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    description
  }
`)

export const getCourseBySlugQuery = defineQuery(`
  *[_type == "course" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    summary,
    coverImage,
    level,
    price,
    popular,
    studentCount,
    learningOutcomes,
    instructor->{
      name,
      "slug": slug.current,
      photo,
      expertise,
      bio
    },
    category->{
      title,
      "slug": slug.current
    },
    modules[]{
      title,
      summary,
      lessons[]->{
        _id,
        title,
        "slug": slug.current,
        duration,
        freePreview,
        videoUrl,
        poster
      }
    }
  }
`)

export const getLessonBySlugQuery = defineQuery(`
  *[_type == "lesson" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    videoUrl,
    poster,
    duration,
    freePreview,
    studentCount,
    notes,
    keyPoints,
    proTip,
    resources
  }
`)

export const getLessonWithCourseQuery = defineQuery(`
  *[_type == "lesson" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    videoUrl,
    poster,
    duration,
    freePreview,
    studentCount,
    notes,
    keyPoints,
    proTip,
    resources,
    "course": *[_type == "course" && references(^._id)][0] {
      _id,
      title,
      "slug": slug.current,
      level,
      coverImage,
      modules[]{
        title,
        summary,
        lessons[]->{
          _id,
          title,
          "slug": slug.current,
          duration,
          freePreview
        }
      }
    }
  }
`)
