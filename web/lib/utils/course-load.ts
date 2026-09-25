/**
 * Returns the first course found for the given slugs, or null when no slug matches.
 * Fetch errors propagate so callers can tell "Sanity is unreachable" apart from "course not found".
 */
export async function loadFirstCourse<T>(
  slugs: string[],
  fetchCourse: (slug: string) => Promise<T | null>
): Promise<T | null> {
  for (const slug of slugs) {
    const course = await fetchCourse(slug);
    if (course) return course;
  }
  return null;
}
