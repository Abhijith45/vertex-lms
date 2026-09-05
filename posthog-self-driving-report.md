# PostHog Self-driving setup report

## Summary

PostHog Self-driving is configured for Vertex. Session Replay and Error Tracking were already enabled, Support was enabled, and native responders for setup health, error tracking, and support tickets were enabled.

A focused scout troop, one learning-journey custom scout, and two Replay Vision monitors are active. Findings should start appearing in the [Self-driving inbox](https://us.posthog.com/project/578473/inbox) within about 30 minutes.

## AI data processing

Approved by the wizard's organization-level gate.

## GitHub

Connected before this setup through the PostHog GitHub App. GitHub Issues was not selected as a Self-driving source.

## Products enabled

| Product | Result | App configuration |
| --- | --- | --- |
| Session Replay | Already enabled | Web app initialization does not disable recording. |
| Error Tracking | Already enabled | `posthog.init` enables exception capture. |
| Support (Conversations) | Enabled | Connect an inbound email, inbox, or Slack channel before tickets can arrive. |

## Signal sources

| Signal source | Action | Notes |
| --- | --- | --- |
| `signals_scout` / `cross_source_issue` | Enabled by default | No opt-out row was created; scout findings can reach the inbox. |
| `health_checks` / `health_issue` | Enabled | Setup-health responder enabled. |
| `error_tracking` / `issue_created` | Enabled | New source config: `01a06625-7f23-78c5-ab62-4e0beb1a7dc3`. |
| `error_tracking` / `issue_reopened` | Enabled | New source config: `01a06625-7e9a-7c78-b21e-8e8d3f167210`. |
| `error_tracking` / `issue_spiking` | Enabled | New source config: `01a06625-7ffd-78c5-8150-686b88682f03`. |
| `conversations` / `ticket` | Enabled | New source config: `01a06625-8007-74b9-a80f-ed774997b3a8`; idle until an inbound channel is connected. |
| Session replay source row | Deliberately skipped | Replay coverage is provided by the Replay Vision scanners below; the retired session-analysis source was not created. |

## Connected tools

No external connected-tool responders were selected. GitHub remains connected as an integration, but its Issues responder was intentionally not enabled.

## Scout troop

**Run budget:** 100 maximum runs/day; 0 used today; 100 remaining. Announcement: “Scouts are in early access. Each project gets up to 100 scout runs a day. Contact team-self-driving@posthog.com if you need more.”

### Active scouts (6)

| Scout | What it watches |
| --- | --- |
| `signals-scout-general` | Cross-product correlations and gaps outside specialist scopes. |
| `signals-scout-product-analytics` | Product-flow funnel, retention, lifecycle, and engagement regressions. |
| `signals-scout-web-analytics` | Traffic, attribution, landing-page health, and 404 patterns. |
| `signals-scout-web-vitals` | Page-level Core Web Vitals regressions. |
| `signals-scout-health-checks` | Actionable PostHog setup-health issues. |
| `signals-scout-learning-discovery-to-start` | Vertex discovery-to-course-start regressions. |

### Disabled built-in scouts (22)

The remaining built-in scouts are disabled to preserve a selective, six-scout troop. Revenue, AI observability, logs, surveys, feature flags, experiments, data pipelines/warehouse, APM, customer analytics, CSP, tasks, MCP calls, insight alerts, skills hygiene, and conversations have no confirmed active product surface in this project. Anomaly detection is disabled because there are no established saved insight baselines. The inbox-validation scout is deferred until there are resolved Self-driving reports to re-measure.

The error-tracking and session-replay scouts remain disabled deliberately: error tracking is covered by native responders, while replay is covered by the Replay Vision monitors below. Enable any disabled specialist later from the inbox if its product surface becomes active.

## Custom scouts

| Scout | Design |
| --- | --- |
| `signals-scout-learning-discovery-to-start` | Created and active. Watches `hero_search_submitted`, `course_catalog_searched`, `course_card_clicked`, and `course_started`. Its discriminator is a broad-reach fall in discovery-to-start progression or course starts while upstream discovery holds. This is more specific than the built-in product-analytics scout, which watches saved flows, and directly covers Vertex’s learning-discovery journey. |

The analysis ruled out a separate revenue, AI, survey, support, and video-completion scout because their event/data surfaces are not confirmed in the repository. Error and replay symptoms were ruled out because their dedicated responders and monitors already own those routes. No approved candidate was declined.

If the custom scout proves noisy, set `emit: false` on its config in PostHog to keep it in dry-run mode without sending reports to the inbox.

## Replay Vision scanners

A scanner is an LLM that watches individual session recordings on a schedule and pushes confirmed findings to the inbox. These are the only components in this setup that spend Replay Vision quota. Findings carry half weight and require independent corroboration before promotion into a report.

| Monitor | Result | Scope and purpose | Sampling | Estimated monthly cost |
| --- | --- | --- | --- | --- |
| Vertex course experience breakage | Created | Watches recordings on `/courses` for course-detail and module-loading failures, broken course or lesson navigation, and a failed Continue Learning action. The course route is the key completion surface leading learners into lessons. | 50% | 0 observations / 0 credits (no recordings in the seven-day estimate window). |
| Vertex learner frustration | Created | Watches recordings containing `$rageclick` for visible difficulty with search, course filters, module expansion, course or lesson links, and Continue Learning. | 100% | 0 observations / 0 credits (no recordings in the seven-day estimate window). |

The monitors are armed and will begin evaluating sessions when recordings arrive. The organization currently has 2,500 Replay Vision credits remaining; both estimates were zero because the project has no recent recordings.

## Follow-ups

- [ ] Connect an inbound Support channel (email, inbox, or Slack) in PostHog so the enabled ticket responder can receive support tickets.
- [ ] Generate production browser traffic and verify Session Replay recordings arrive; the scanner estimates were zero because there were no recordings in the recent window.
- [ ] The PostHog MCP connection lacks `property_definition:read`, so the live event schema could not be independently read during setup. Reauthorize that scope if direct event-schema inspection is needed; the custom scout validates its event taxonomy before querying.

## What happens next

The scout coordinator picks up fresh configs within about 30 minutes. Scouts draw from the verified 100-run daily budget, and findings cluster into reports in the [Self-driving inbox](https://us.posthog.com/project/578473/inbox). Immediately actionable reports can begin coding tasks.

## Project files

- Created `posthog-self-driving-report.md`.
- No application source files were modified; the existing PostHog browser initialization already supported replay and exception capture.
