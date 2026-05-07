# Engineering Standards Gap Analysis

## Angular RealWorld Example App (Conduit)

> Assessment of the Angular RealWorld codebase against engineering best practices. Each gap includes a severity rating and estimated remediation effort.

---

### Severity Scale

| Rating       | Meaning                                                                               |
| ------------ | ------------------------------------------------------------------------------------- |
| **Critical** | Blocks production readiness; security vulnerability or data loss risk                 |
| **High**     | Significant quality or reliability concern; should be addressed before major releases |
| **Medium**   | Deviation from best practices; manageable risk but accumulates tech debt              |
| **Low**      | Polish item; nice-to-have improvement                                                 |

### Effort Scale

| Rating     | Meaning                                                        |
| ---------- | -------------------------------------------------------------- |
| **Small**  | < 2 hours; localized change                                    |
| **Medium** | 2-8 hours; touches multiple files or requires design decisions |
| **Large**  | 1-3 days; cross-cutting concern or significant refactor        |

---

## 1. Code Organization

### GAP-1.1: No Linting or Static Analysis

**Severity:** High | **Effort:** Small

The project has Prettier for formatting but **no ESLint or Angular ESLint** configuration. There is no static analysis to catch unused variables, missing return types, inconsistent imports, or Angular-specific anti-patterns (e.g., subscribing in components without cleanup).

**Evidence:** `package.json` contains no `eslint`, `@angular-eslint`, or `@typescript-eslint` dependencies. No `.eslintrc` or `eslint.config.*` files exist.

**Risk:** Code quality regressions go undetected; contributors rely entirely on manual review.

---

### GAP-1.2: Inconsistent Service Injection Patterns

**Severity:** Low | **Effort:** Small

Some services use `inject()` function (modern Angular pattern) while others use constructor injection. Both work correctly, but the inconsistency increases cognitive load.

**Evidence:** `UserService` and layout components use `inject()`, while some feature components still use constructor-based injection.

**Risk:** Low — functional impact is nil, but inconsistency signals unmaintained code to new contributors.

---

### GAP-1.3: No Shared Constants or Configuration Module

**Severity:** Medium | **Effort:** Small

Magic strings and numbers appear directly in code (e.g., `'jwtToken'` localStorage key in `JwtService`, pagination defaults). There is no centralized constants file.

**Evidence:** `JwtService` hardcodes `'jwtToken'`; `ArticleListComponent` uses inline pagination values.

**Risk:** Typos in string keys cause silent failures; changing a value requires finding all occurrences.

---

## 2. Error Handling

### GAP-2.1: Incomplete Error Interceptor Coverage

**Severity:** High | **Effort:** Medium

The `errorInterceptor` handles `401` (purges auth) but does not provide structured handling for other common HTTP errors (`403`, `404`, `422`, `500`). Error normalization is minimal — most components receive raw `HttpErrorResponse` objects.

**Evidence:** `error.interceptor.ts` only checks for status `401`. Components like `AuthComponent` manually extract and display `errors` from response bodies with no fallback for unexpected error shapes.

**Risk:** Users see cryptic or missing error messages for non-401 failures; 500 errors surface as raw objects.

---

### GAP-2.2: No Global Error Handler

**Severity:** Medium | **Effort:** Medium

Angular's `ErrorHandler` is not overridden. Uncaught exceptions (JavaScript runtime errors, unhandled promise rejections, RxJS errors without `catchError`) are only logged to the browser console.

**Evidence:** No custom `ErrorHandler` provider in `app.config.ts`. No global error boundary component.

**Risk:** Runtime errors silently break the UI without user feedback; no error reporting to external services.

---

### GAP-2.3: No Retry or Timeout on HTTP Requests

**Severity:** Medium | **Effort:** Small

No RxJS `retry`, `retryWhen`, or `timeout` operators are applied to HTTP calls. A single transient network failure results in immediate error display.

**Evidence:** All service methods (e.g., `ArticlesService.query()`, `UserService.login()`) pipe directly from `HttpClient` without retry logic.

**Risk:** Users on flaky connections see errors that would have resolved with a single retry.

---

## 3. Testing

### GAP-3.1: No Component-Level Unit Tests

**Severity:** High | **Effort:** Large

All 6 existing unit test files cover **services only**. Zero unit tests exist for any component, pipe, directive, or guard. This means template rendering, input/output bindings, and UI logic are completely untested at the unit level.

**Evidence:** `*.spec.ts` files exist only under `services/` directories. No spec files for `HomeComponent`, `ArticleListComponent`, `HeaderComponent`, `MarkdownPipe`, `AuthGuard`, `ShowAuthedDirective`, etc.

**Risk:** UI regressions go undetected; refactoring components is high-risk without test coverage.

---

### GAP-3.2: No Code Coverage Reporting

**Severity:** Medium | **Effort:** Small

Vitest is configured but no coverage provider (`@vitest/coverage-v8` or `@vitest/coverage-istanbul`) is installed. There is no coverage threshold or CI gate.

**Evidence:** `vitest.config.ts` has no `coverage` configuration. `package.json` contains no coverage-related dependencies.

**Risk:** Test coverage can silently degrade with no visibility or enforcement.

---

### GAP-3.3: E2E Tests Lack CI Integration

**Severity:** Medium | **Effort:** Medium

12 Playwright E2E spec files exist but there is no CI workflow to run them. The E2E tests require a running backend and dev server, but no `docker-compose` or test backend stub is provided.

**Evidence:** No `.github/workflows/` directory. No CI configuration files. `playwright.config.ts` references `localhost:4200` but no script orchestrates the full stack.

**Risk:** E2E tests may drift from actual app behavior if not run regularly; no automated regression detection.

---

## 4. Security

### GAP-4.1: JWT Stored in localStorage

**Severity:** High | **Effort:** Medium

JWT tokens are stored in `localStorage`, which is accessible to any JavaScript running on the page. This makes the token vulnerable to XSS attacks.

**Evidence:** `JwtService` uses `localStorage.setItem('jwtToken', token)` and `localStorage['jwtToken']`.

**Risk:** If an XSS vulnerability exists (or is introduced), an attacker can exfiltrate the JWT and impersonate the user. Industry best practice is to use `httpOnly` cookies or in-memory storage with refresh tokens.

---

### GAP-4.2: Markdown Rendering XSS Surface

**Severity:** Medium | **Effort:** Small

`MarkdownPipe` uses `marked` to convert user-submitted article bodies to HTML, then bypasses Angular's sanitizer with `DomSanitizer.bypassSecurityTrustHtml()`. While `marked` does some sanitization, `bypassSecurityTrustHtml` explicitly opts out of Angular's XSS protection.

**Evidence:** `markdown.pipe.ts` calls `this.sanitizer.bypassSecurityTrustHtml(marked(value))`.

**Risk:** Malicious article content could inject scripts. E2E tests (`xss-security.spec.ts`) exist but the trust bypass is inherently risky.

---

### GAP-4.3: No Content Security Policy

**Severity:** Medium | **Effort:** Small

No `Content-Security-Policy` header or meta tag is configured. The app loads styles from external CDNs (Google Fonts, Ionicons) without SRI (Subresource Integrity) hashes.

**Evidence:** `index.html` includes `<link>` tags to `fonts.googleapis.com` and `ionicons` CDN without `integrity` attributes.

**Risk:** CDN compromise could inject malicious code; no CSP means no defense-in-depth against XSS.

---

### GAP-4.4: No Input Validation on Forms

**Severity:** Medium | **Effort:** Medium

Client-side forms (login, register, editor, settings) submit user input with minimal or no validation. The `EditorComponent` allows empty titles and bodies. The `AuthComponent` does not validate email format.

**Evidence:** Form controls in `AuthComponent`, `EditorComponent`, and `SettingsComponent` use `FormControl` without validators. Validation relies entirely on the backend.

**Risk:** Poor UX (users discover errors only after server round-trip); increased backend load from invalid requests.

---

## 5. API Design

### GAP-5.1: No API Versioning Strategy

**Severity:** Low | **Effort:** Small

The API base URL is hardcoded without versioning (e.g., `/api/v1/`). If the backend introduces breaking changes, there is no client-side mechanism to target a specific API version.

**Evidence:** `environment.ts` sets `api_url: 'https://api.realworld.io/api'` — no version segment.

**Risk:** Low for a demo app; relevant if adopted for production with evolving API contracts.

---

### GAP-5.2: No Request/Response Type Validation at Runtime

**Severity:** Medium | **Effort:** Medium

TypeScript interfaces provide compile-time safety but offer no runtime validation. If the API returns unexpected shapes (missing fields, wrong types), the app silently renders broken data.

**Evidence:** All service methods cast API responses directly to TypeScript interfaces (e.g., `map(data => data.article)`). No runtime schema validation (Zod, io-ts, class-validator, etc.).

**Risk:** Backend changes or corrupted responses cause subtle UI bugs rather than clear error messages.

---

## 6. Observability

### GAP-6.1: No Structured Logging

**Severity:** Medium | **Effort:** Medium

The application has no logging strategy. There are no `console.log`, `console.error`, or structured log calls in service or component code. Errors from the interceptor chain are silently swallowed or re-thrown without logging.

**Evidence:** Grep for `console.log` / `console.error` across `src/app/` returns zero results in application code.

**Risk:** Debugging production issues requires reproducing them locally; no telemetry for error frequency or user impact.

---

### GAP-6.2: No Health Check Endpoint

**Severity:** Low | **Effort:** Small

The frontend SPA does not expose a health check route or status page. While this is less critical for SPAs than backends, it means monitoring tools cannot verify the app is serving correctly.

**Evidence:** No `/health` or `/status` route in `app.routes.ts`.

**Risk:** Low — standard practice for SPAs is to rely on hosting-level health checks. Relevant if deploying behind a load balancer that requires application-level health probes.

---

### GAP-6.3: No Performance Monitoring

**Severity:** Low | **Effort:** Medium

No Web Vitals, Real User Monitoring (RUM), or Angular-specific performance tracking is implemented. Route change timing, API latency, and rendering performance are not measured.

**Evidence:** No performance monitoring libraries in `package.json`. No `PerformanceObserver` or analytics integration.

**Risk:** Performance regressions go undetected until users complain.

---

## 7. Resilience

### GAP-7.1: No Loading or Error States for Data-Dependent Views

**Severity:** High | **Effort:** Medium

While a `LoadingState` enum exists (`NOT_LOADED`, `LOADING`, `LOADED`), many components do not implement proper loading indicators or error fallbacks. If an API call fails, the user sees an empty or broken page.

**Evidence:** `HomeComponent` shows article lists but has no skeleton loader or error state. `ArticleComponent` does not handle the case where the article fetch fails (other than an empty page). `LoadingState` is defined but its usage is inconsistent across components.

**Risk:** Poor user experience during slow connections or API outages; users cannot distinguish "loading" from "empty" from "error".

---

### GAP-7.2: No Offline or Cache Strategy

**Severity:** Low | **Effort:** Large

The app has no Service Worker, PWA manifest, or HTTP caching strategy. Every page navigation triggers fresh API calls.

**Evidence:** No `ngsw-config.json`, no `@angular/service-worker` dependency, no cache headers set client-side.

**Risk:** Low for a demo app; relevant for production use where offline support or reduced API load is valuable.

---

### GAP-7.3: No Graceful Degradation for External CDN Failures

**Severity:** Low | **Effort:** Small

CSS and fonts are loaded from external CDNs (Google Fonts, Ionicons). If these CDNs are unavailable, the UI degrades without fallback styles.

**Evidence:** `index.html` loads `//demo.productionready.io/main.css`, Google Fonts, and Ionicons from CDN URLs.

**Risk:** CDN outages cause visual degradation; no self-hosted fallbacks.

---

## Summary Matrix

| ID      | Gap                                     | Severity | Effort |
| ------- | --------------------------------------- | -------- | ------ |
| GAP-1.1 | No linting or static analysis           | High     | Small  |
| GAP-1.2 | Inconsistent service injection patterns | Low      | Small  |
| GAP-1.3 | No shared constants module              | Medium   | Small  |
| GAP-2.1 | Incomplete error interceptor coverage   | High     | Medium |
| GAP-2.2 | No global error handler                 | Medium   | Medium |
| GAP-2.3 | No retry/timeout on HTTP requests       | Medium   | Small  |
| GAP-3.1 | No component-level unit tests           | High     | Large  |
| GAP-3.2 | No code coverage reporting              | Medium   | Small  |
| GAP-3.3 | E2E tests lack CI integration           | Medium   | Medium |
| GAP-4.1 | JWT stored in localStorage              | High     | Medium |
| GAP-4.2 | Markdown rendering XSS surface          | Medium   | Small  |
| GAP-4.3 | No Content Security Policy              | Medium   | Small  |
| GAP-4.4 | No input validation on forms            | Medium   | Medium |
| GAP-5.1 | No API versioning strategy              | Low      | Small  |
| GAP-5.2 | No runtime response validation          | Medium   | Medium |
| GAP-6.1 | No structured logging                   | Medium   | Medium |
| GAP-6.2 | No health check endpoint                | Low      | Small  |
| GAP-6.3 | No performance monitoring               | Low      | Medium |
| GAP-7.1 | No loading/error states for views       | High     | Medium |
| GAP-7.2 | No offline or cache strategy            | Low      | Large  |
| GAP-7.3 | No CDN fallback strategy                | Low      | Small  |
