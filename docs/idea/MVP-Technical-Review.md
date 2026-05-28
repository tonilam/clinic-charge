# MVP Technical Review - Code Quality, Security, Efficiency

> [!info] Scope
> Review target: current MVP implementation across backend (`FastAPI + SQLAlchemy`), frontend (`Angular + AG Grid`), testing, and local Docker runtime.
>
> Review lens: **code quality**, **security**, **efficiency/performance**, and **delivery readiness**.

---

## Executive Snapshot

> [!summary] Overall Assessment
> The MVP is a strong baseline: clean layered architecture, readable service boundaries, practical pagination/filtering, and good test coverage for core CRUD paths.
>
> The biggest gaps before hardening are:
> - stronger **input constraints and abuse limits** on list endpoints
> - improved **security posture** (rate limiting, security headers, prod-safe defaults)
> - better **runtime observability and error telemetry**
> - a few **frontend data consistency** edge cases under concurrent edits/rapid actions

```mermaid
quadrantChart
    title Priority Matrix (Impact vs Effort)
    x-axis Low Effort --> High Effort
    y-axis Low Impact --> High Impact
    quadrant-1 Quick Wins
    quadrant-2 Strategic Bets
    quadrant-3 Backlog
    quadrant-4 Avoid
    "Validate startRow/endRow bounds": [0.25, 0.86]
    "Add API rate limiting": [0.38, 0.92]
    "Structured request logging + trace IDs": [0.30, 0.84]
    "Security headers + trusted hosts": [0.35, 0.78]
    "Fix frontend subscription lifecycle": [0.40, 0.70]
    "DB index tuning for ILIKE search": [0.68, 0.76]
    "Move from offset to keyset pagination": [0.82, 0.74]
    "AuthN/AuthZ rollout": [0.86, 0.96]
```

---

## What Is Working Well

- Clear backend layering (`router -> service -> db`) makes ownership boundaries easy.
- Pydantic validation is in place for create/update schemas, including positive amount checks.
- AG Grid infinite-row flow and refresh trigger model are coherent for MVP scale.
- Integration + unit tests cover main CRUD and pagination/filtering behaviors.
- Dockerized local environment is practical and reproducible for development.

---

## Findings by Priority

## P0 (High Risk / High Value)

> [!warning] 1) List endpoint lacks strict query bounds
> Current API accepts `startRow/endRow` without explicit validation constraints.
>
> **Risk**
> - Very large page windows can drive expensive DB reads and memory pressure.
> - Negative/invalid combinations can produce undefined pagination behavior.
>
> **Improve**
> - Enforce typed constraints at API boundary (e.g. `startRow >= 0`, `endRow > startRow`, `max window <= N`).
> - Return 422 for invalid windows with clear error payload.

> [!warning] 2) No auth/rate limiting for mutating endpoints
> `POST` and `PATCH` are open in current MVP design.
>
> **Risk**
> - Unauthorized writes, abuse, and test/prod data poisoning.
> - High write volume can become an easy denial-of-service vector.
>
> **Improve**
> - Add basic API key or JWT auth for non-local environments.
> - Add request rate limits (global + per-IP + per-route).
> - Add write-path audit fields/logging for accountability.

> [!warning] 3) Global exception handler hides incident diagnostics
> Generic 500 response is user-safe, but no structured logging/trace correlation is visible.
>
> **Risk**
> - Operationally difficult to triage production incidents.
> - Hidden failure trends until users report them.
>
> **Improve**
> - Log exceptions with request context + correlation ID.
> - Add explicit error classes for expected failures.
> - Integrate monitoring (errors, latency, saturation).

## P1 (Important, near-term hardening)

> [!tip] 4) CORS and environment posture should be stricter outside local
> Dev-friendly defaults are currently broad and easy to misconfigure in real deployment.
>
> **Improve**
> - Separate dev/prod config profiles.
> - Fail fast when default credentials are used in non-local environment.
> - Add secure defaults (`DEBUG=false`, explicit origin allowlist per env).

> [!tip] 5) Frontend subscription lifecycle can leak under heavy interaction
> Grid row fetch/edit calls subscribe directly; repeated interactions may accumulate unmanaged subscriptions.
>
> **Improve**
> - Use `takeUntilDestroyed()` / RxJS finalize patterns.
> - Centralize API error handling in interceptor to reduce duplicated UI error logic.

> [!tip] 6) Inline edit flow lacks optimistic concurrency guard
> Last-write-wins updates may overwrite concurrent edits silently.
>
> **Improve**
> - Use `updated_at` precondition check (or ETag/If-Match).
> - On conflict, return 409 and prompt user to refresh/retry.

## P2 (Efficiency and scaling path)

> [!note] 7) Filter query uses `ILIKE '%term%'` on centre name
> Useful for UX, but can degrade as data grows due to leading wildcard scans.
>
> **Improve**
> - Add trigram index (`pg_trgm`) or search-normalized column.
> - Consider `startswith` filter mode for high-volume datasets.

> [!note] 8) Offset pagination is acceptable now, less ideal at scale
> Offset cost rises with large tables and deeper pages.
>
> **Improve**
> - Keep offset for MVP, but plan keyset/cursor mode for growth.
> - Provide stable sort + cursor token to preserve user navigation consistency.

> [!note] 9) Test suite has limited non-happy-path security/perf cases
> Current tests are solid on behavior, but fewer adversarial scenarios are covered.
>
> **Improve**
> - Add tests for malformed query bounds, oversized page requests, and invalid PATCH payloads.
> - Add lightweight load checks for list endpoint (p95 latency guard).

---

## Scorecard (Current State)

```mermaid
pie showData
    title MVP Quality Distribution (relative strength)
    "Code Structure" : 24
    "Test Coverage" : 22
    "Security" : 14
    "Observability" : 12
    "Scalability Readiness" : 16
    "Operational Readiness" : 12
```

> [!abstract] Interpretation
> Architecture and baseline testing are good for MVP.
> Security and observability are the highest-leverage investment areas.

---

## Suggested 2-Week Hardening Plan

```mermaid
gantt
    title MVP Hardening Sprint Plan
    dateFormat  YYYY-MM-DD
    axisFormat  %d %b

    section Week 1
    API input bounds + validation           :a1, 2026-05-28, 2d
    Basic rate limiting + trusted hosts     :a2, after a1, 2d
    Structured logging + trace IDs          :a3, after a1, 2d

    section Week 2
    Frontend subscription/error refactor    :b1, 2026-06-04, 2d
    Concurrency conflict handling (409 path):b2, after b1, 2d
    Targeted perf + abuse test additions    :b3, after b1, 2d
```

---

## Practical Next Actions (Top 5)

- Add request parameter constraints for `startRow/endRow` and cap page window size.
- Introduce baseline API protection (auth for non-local + route-level rate limiting).
- Add structured logs with correlation IDs and error classes for reliable incident triage.
- Refactor frontend API subscriptions to guaranteed teardown patterns.
- Add DB/search performance guardrails and adversarial endpoint tests.

---

## Final Verdict

> [!success] MVP Status
> **Build quality is healthy for a functional MVP demo.**
>
> To be production-safe, prioritize:
> 1) API safety controls, 2) observability, 3) concurrency-safe updates, and 4) scaling guardrails.
