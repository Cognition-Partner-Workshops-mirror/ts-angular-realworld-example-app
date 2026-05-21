# Gap Analysis — Angular RealWorld Example App (Conduit)

This document compares the codebase against engineering best practices across seven categories. Each gap is rated by **Severity** (Critical / High / Medium / Low) and **Effort** (Small / Medium / Large).

---

## 1. Code Organization

### Strengths

- Clean feature-based folder structure (`core/`, `features/`, `shared/`)
- Standalone components with explicit imports (no NgModule overhead)
- Consistent use of `ChangeDetectionStrategy.OnPush` across all components
- Proper separation of concerns: services handle HTTP, components handle UI

### Gaps

| #   | Gap                                         | Severity | Effort | Details                                                                                                                                                                                                                         |
| --- | ------------------------------------------- | -------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1 | No path aliases configured                  | Medium   | Small  | The codebase uses deep relative imports (`../../../../core/auth/services/user.service`). A `tsconfig` path alias (e.g., `@app/core`) would improve readability. Vitest already has `@` → `./src` but it's not used in app code. |
| 1.2 | No dedicated barrel/index exports           | Low      | Small  | Feature folders lack `index.ts` barrel files, leading to longer import paths.                                                                                                                                                   |
| 1.3 | No ESLint/Angular ESLint configured         | High     | Medium | Only Prettier is set up. No linting for Angular best practices, unused imports, or code smells. `angular-eslint` is not in dependencies.                                                                                        |
| 1.4 | `@ts-ignore` usage in `articles.service.ts` | Medium   | Small  | Line 18 uses `@ts-ignore` to suppress a type error in filter iteration. Should use proper typed access.                                                                                                                         |
| 1.5 | Mixed signal/observable patterns            | Low      | Large  | Some components use `signal()` for local state while relying on `AsyncPipe` for service data. A consistent pattern (all signals or all observables) would reduce cognitive load.                                                |

---

## 2. Error Handling

### Strengths

- Centralized error interceptor with normalized error format
- Distinct handling for 4XX vs 5XX on auth endpoint
- `ListErrorsComponent` for consistent error display
- Graceful "unavailable" mode with auto-retry on server errors

### Gaps

| #   | Gap                                        | Severity | Effort | Details                                                                                                                                   |
| --- | ------------------------------------------ | -------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1 | No global error boundary / fallback UI     | Medium   | Medium | If a component throws during rendering, there's no `ErrorHandler` override or UI recovery. Angular's default just logs to console.        |
| 2.2 | Silent error swallowing in some components | Medium   | Small  | `FavoriteButtonComponent` and `FollowButtonComponent` catch errors with an empty `error: () => {}` handler — no user feedback on failure. |
| 2.3 | No error tracking/reporting service        | Medium   | Medium | Errors are only logged to browser console. No integration with Sentry, Datadog, or similar for production monitoring.                     |
| 2.4 | Inconsistent error display                 | Low      | Small  | Some components (Article, Profile) show errors via `ListErrorsComponent`, others (Favorite, Follow) silently fail.                        |

---

## 3. Testing

### Strengths

- Unit tests for all services (JWT, User, Articles, Comments, Tags, Profile)
- Comprehensive E2E suite covering auth flows, CRUD, navigation, error handling
- Security-specific E2E tests (XSS injection via API)
- Proper test isolation with `HttpTestingController.verify()`
- Debug interface (`__conduit_debug__`) for reliable E2E state verification

### Gaps

| #   | Gap                                    | Severity | Effort | Details                                                                                                              |
| --- | -------------------------------------- | -------- | ------ | -------------------------------------------------------------------------------------------------------------------- |
| 3.1 | No component unit tests                | High     | Large  | Zero unit tests for any component (Home, Article, Editor, Profile, Settings, Auth). Only services are tested.        |
| 3.2 | No test coverage threshold enforcement | Medium   | Small  | `vitest.config.ts` configures coverage reporters but no minimum thresholds are set.                                  |
| 3.3 | No integration tests for interceptors  | Medium   | Medium | The three interceptors (api, token, error) have no dedicated test files. They're only indirectly tested through E2E. |
| 3.4 | No contract/API schema tests           | Low      | Medium | No validation that the frontend's expected API shapes match the backend's actual responses.                          |
| 3.5 | E2E tests use only Chromium            | Low      | Small  | Firefox and WebKit projects are commented out in `playwright.config.ts`.                                             |

---

## 4. Security

### Strengths

- HTML sanitization via Angular's `DomSanitizer` in the Markdown pipe
- Dedicated XSS security E2E tests
- Token cleared on 401 (prevents stale token usage)
- No secrets in source code
- Pre-commit hooks prevent accidental code style violations

### Gaps

| #   | Gap                                              | Severity | Effort | Details                                                                                                                             |
| --- | ------------------------------------------------ | -------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| 4.1 | No Content Security Policy (CSP)                 | High     | Medium | No CSP headers configured. External CDN resources (Ionicons, Google Fonts) load without integrity checks.                           |
| 4.2 | Token stored in localStorage (XSS-accessible)    | Medium   | Large  | JWT stored in `localStorage` is accessible to any XSS payload. `httpOnly` cookies would be more secure but require backend changes. |
| 4.3 | No input validation beyond `Validators.required` | Medium   | Small  | Login/register forms only check for non-empty. No email format validation, password strength rules, or length limits.               |
| 4.4 | No Subresource Integrity (SRI) on CDN links      | Medium   | Small  | External CSS (Ionicons, Google Fonts) loaded without `integrity` attributes in `index.html`.                                        |
| 4.5 | No rate limiting awareness on login              | Low      | Medium | No client-side handling of rate-limited responses (429). Repeated failed logins could lock accounts.                                |
| 4.6 | No dependency vulnerability scanning             | Medium   | Small  | No `npm audit`, Snyk, or Dependabot configuration for automated CVE detection.                                                      |

---

## 5. API Design

### Strengths

- Follows RealWorld API specification consistently
- Proper RESTful conventions (GET, POST, PUT, DELETE)
- Query params for filtering and pagination
- Consistent response wrapper format (`{ article: ... }`, `{ user: ... }`)

### Gaps

| #   | Gap                                            | Severity | Effort | Details                                                                                                  |
| --- | ---------------------------------------------- | -------- | ------ | -------------------------------------------------------------------------------------------------------- |
| 5.1 | No OpenAPI/Swagger documentation               | Medium   | Medium | API surface is only documented implicitly in service files. No machine-readable API spec.                |
| 5.2 | No API versioning awareness                    | Low      | Small  | Frontend hardcodes base URL without version path. Backend API changes could break the app silently.      |
| 5.3 | No request/response type validation at runtime | Medium   | Medium | TypeScript types are compile-time only. No runtime validation (e.g., Zod) to catch API contract drift.   |
| 5.4 | Pagination metadata incomplete                 | Low      | Small  | API returns `articlesCount` but no `totalPages`, `hasNext`, or cursor. Client calculates pages manually. |

---

## 6. Observability

### Strengths

- Debug interface (`window.__conduit_debug__`) for state inspection
- Auth state machine with clear transitions (loading → authenticated/unauthenticated/unavailable)

### Gaps

| #   | Gap                                | Severity | Effort | Details                                                                                                                              |
| --- | ---------------------------------- | -------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| 6.1 | No structured logging              | High     | Medium | No logging framework (e.g., `ngx-logger`). Only `console.error` in `main.ts` bootstrap. Debug info only available via E2E interface. |
| 6.2 | No performance monitoring          | Medium   | Medium | No Web Vitals, Lighthouse CI, or RUM integration. Bundle budgets exist but no runtime perf tracking.                                 |
| 6.3 | No health check endpoint awareness | Low      | Small  | App doesn't verify backend health proactively (only discovers issues on failed requests).                                            |
| 6.4 | No analytics integration           | Low      | Medium | Angular CLI analytics ID exists but no user-facing analytics (page views, feature usage).                                            |
| 6.5 | No error reporting service         | Medium   | Medium | Same as 2.3 — no Sentry/Datadog/Bugsnag for production error aggregation.                                                            |

---

## 7. Resilience

### Strengths

- Exponential backoff retry on auth service (2s → 4s → 8s → 16s cap)
- Graceful "unavailable" mode with UI feedback ("Connecting...")
- `takeUntilDestroyed` prevents memory leaks from subscriptions
- Serial E2E tests avoid race conditions

### Gaps

| #   | Gap                                     | Severity | Effort | Details                                                                                                                             |
| --- | --------------------------------------- | -------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| 7.1 | No retry logic for non-auth API calls   | High     | Medium | Only `GET /user` retries on failure. Article/comment/tag fetches fail immediately with no retry.                                    |
| 7.2 | No request timeout configuration        | Medium   | Small  | HTTP requests have no explicit timeout. Slow/hung connections could leave the UI in loading state indefinitely.                     |
| 7.3 | No offline detection / service worker   | Medium   | Large  | App has no awareness of network status. No caching strategy or offline fallback.                                                    |
| 7.4 | No optimistic updates                   | Low      | Medium | Favorite/follow actions wait for server response before updating UI. Optimistic updates would improve perceived performance.        |
| 7.5 | No request deduplication/cancellation   | Low      | Medium | Multiple rapid pagination clicks could fire overlapping requests. Only `takeUntilDestroyed` protects against component destruction. |
| 7.6 | No circuit breaker for failed endpoints | Low      | Large  | If the articles endpoint is down, every page navigation re-attempts. No backoff or circuit-break pattern for non-auth endpoints.    |

---

## Summary Table

| Category          | Critical | High  | Medium | Low    | Total Gaps |
| ----------------- | -------- | ----- | ------ | ------ | ---------- |
| Code Organization | 0        | 1     | 2      | 2      | 5          |
| Error Handling    | 0        | 0     | 3      | 1      | 4          |
| Testing           | 0        | 1     | 2      | 2      | 5          |
| Security          | 0        | 1     | 3      | 2      | 6          |
| API Design        | 0        | 0     | 2      | 2      | 4          |
| Observability     | 0        | 1     | 3      | 1      | 5          |
| Resilience        | 0        | 1     | 2      | 3      | 6          |
| **Totals**        | **0**    | **5** | **17** | **13** | **35**     |
