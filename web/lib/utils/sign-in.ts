/**
 * Detects Clerk's `session_exists` error. Clerk returns it when a verify call
 * runs after the sign-in already created a session, so the user is signed in.
 */
export function isSessionExistsError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const { code, errors } = error as { code?: unknown; errors?: unknown };
  if (code === "session_exists") return true;

  return (
    Array.isArray(errors) &&
    errors.some(
      (e) => !!e && typeof e === "object" && (e as { code?: unknown }).code === "session_exists"
    )
  );
}
