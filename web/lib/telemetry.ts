export interface SpanMetric {
  name: string;
  durationMs: number;
  success: boolean;
  timestamp: string;
  error?: string;
}

// In-memory telemetry log for metrics inspection
const TRACE_METRICS_LOG: SpanMetric[] = [];

/**
 * Safely dispatches metrics to PostHog if available
 */
async function recordSpanTelemetry(
  spanName: string,
  durationMs: number,
  metadata: Record<string, unknown>
) {
  try {
    const moduleSpecifier = "./posthog-server";
    const { getPostHogClient } = await import(moduleSpecifier);
    const client = getPostHogClient();
    client.capture({
      distinctId: "server-telemetry",
      event: "performance_span_recorded",
      properties: {
        span_name: spanName,
        duration_ms: durationMs,
        ...metadata,
      },
    });
  } catch {
    // Graceful fallback in environments without posthog
  }
}

/**
 * Executes an asynchronous function within an instrumented performance span,
 * measuring exact execution duration, recording metrics, and reporting to telemetry.
 */
export async function traceSpan<T>(
  spanName: string,
  fn: () => Promise<T>,
  metadata: Record<string, unknown> = {}
): Promise<{ result: T; durationMs: number }> {
  const start = performance.now();
  let errorMsg: string | undefined;

  try {
    const result = await fn();
    const durationMs = Math.round((performance.now() - start) * 100) / 100;

    const metric: SpanMetric = {
      name: spanName,
      durationMs,
      success: true,
      timestamp: new Date().toISOString(),
    };

    TRACE_METRICS_LOG.push(metric);
    if (TRACE_METRICS_LOG.length > 100) {
      TRACE_METRICS_LOG.shift();
    }

    recordSpanTelemetry(spanName, durationMs, metadata);

    return { result, durationMs };
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : String(err);
    const durationMs = Math.round((performance.now() - start) * 100) / 100;

    const metric: SpanMetric = {
      name: spanName,
      durationMs,
      success: false,
      timestamp: new Date().toISOString(),
      error: errorMsg,
    };

    TRACE_METRICS_LOG.push(metric);
    throw err;
  }
}

/**
 * Retrieve recent telemetry performance spans.
 */
export function getRecentSpanMetrics(): SpanMetric[] {
  return [...TRACE_METRICS_LOG];
}

