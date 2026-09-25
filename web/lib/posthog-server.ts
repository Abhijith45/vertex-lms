import { PostHog } from "posthog-node";

let posthogClient: PostHog | null = null;

export function getPostHogClient(): PostHog {
  if (!posthogClient) {
    posthogClient = new PostHog(
      process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!,
      {
        host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        flushAt: 1,
        flushInterval: 0,
      }
    );
  }
  return posthogClient;
}

export async function captureServerException(
  error: unknown,
  properties: Record<string, unknown>
): Promise<void> {
  try {
    await getPostHogClient().captureExceptionImmediate(error, undefined, properties);
  } catch (captureError) {
    console.error("Failed to report exception to PostHog:", captureError);
  }
}
