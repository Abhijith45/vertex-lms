export interface CurriculumLesson {
  _id?: string;
  title: string;
  slug: string;
  duration?: number;
  freePreview?: boolean;
}

export interface CurriculumModule {
  title: string;
  summary?: string;
  lessons?: CurriculumLesson[];
}

export interface CurriculumCourse {
  _id?: string;
  title: string;
  slug: string;
  level?: string;
  modules?: CurriculumModule[];
}

export interface ResolvedCurriculumLocation {
  moduleIndex: number; // 0-based
  moduleNumber: number; // 1-based (e.g. 5)
  lessonIndexInModule: number; // 0-based
  lessonNumberInModule: number; // 1-based (e.g. 1)
  lessonLabel: string; // e.g. "Lesson 5.1"
  totalModules: number;
  totalLessons: number;
  currentLesson: CurriculumLesson | null;
  currentModule: CurriculumModule | null;
  prevLesson: { lesson: CurriculumLesson; module: CurriculumModule } | null;
  nextLesson: { lesson: CurriculumLesson; module: CurriculumModule } | null;
}

/**
 * Traverse curriculum to resolve current lesson location, numbering, and adjacent lessons.
 */
export function resolveCurriculum(
  course?: CurriculumCourse | null,
  currentLessonSlug?: string
): ResolvedCurriculumLocation {
  const modules = course?.modules || [];
  let totalLessons = 0;
  let foundModuleIdx = -1;
  let foundLessonIdx = -1;

  // Flattened list of all lessons with their parent modules
  const allOrdered: Array<{
    lesson: CurriculumLesson;
    module: CurriculumModule;
    moduleIndex: number;
    lessonIndex: number;
  }> = [];

  modules.forEach((mod, mIdx) => {
    (mod.lessons || []).forEach((les, lIdx) => {
      const slug = typeof les.slug === "object" ? (les.slug as { current: string })?.current : les.slug;
      allOrdered.push({
        lesson: { ...les, slug },
        module: mod,
        moduleIndex: mIdx,
        lessonIndex: lIdx,
      });

      if (slug === currentLessonSlug) {
        foundModuleIdx = mIdx;
        foundLessonIdx = lIdx;
      }
      totalLessons++;
    });
  });

  const currentIndex = allOrdered.findIndex(
    (item) => item.lesson.slug === currentLessonSlug
  );

  const prevItem = currentIndex > 0 ? allOrdered[currentIndex - 1] : null;
  const nextItem =
    currentIndex >= 0 && currentIndex < allOrdered.length - 1
      ? allOrdered[currentIndex + 1]
      : null;

  const currentModule = foundModuleIdx >= 0 ? modules[foundModuleIdx] : modules[0] || null;
  const currentLesson =
    currentIndex >= 0 ? allOrdered[currentIndex].lesson : allOrdered[0]?.lesson || null;

  const moduleNum = foundModuleIdx >= 0 ? foundModuleIdx + 1 : 1;
  const lessonNum = foundLessonIdx >= 0 ? foundLessonIdx + 1 : 1;

  return {
    moduleIndex: foundModuleIdx >= 0 ? foundModuleIdx : 0,
    moduleNumber: moduleNum,
    lessonIndexInModule: foundLessonIdx >= 0 ? foundLessonIdx : 0,
    lessonNumberInModule: lessonNum,
    lessonLabel: `Lesson ${moduleNum}.${lessonNum}`,
    totalModules: modules.length,
    totalLessons,
    currentLesson,
    currentModule,
    prevLesson: prevItem ? { lesson: prevItem.lesson, module: prevItem.module } : null,
    nextLesson: nextItem ? { lesson: nextItem.lesson, module: nextItem.module } : null,
  };
}
