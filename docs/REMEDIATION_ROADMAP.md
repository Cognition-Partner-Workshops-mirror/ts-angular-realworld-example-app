# Remediation Roadmap

## Angular RealWorld Example App (Conduit)

> Phased plan to address the gaps identified in the [Gap Analysis](./GAP_ANALYSIS.md). Each item includes a sample Devin prompt to execute the remediation.

---

## Phase 1 — Quick Wins (High Impact, Small-Medium Effort)

Items that deliver immediate quality improvements with minimal risk.

### 1.1 Add ESLint with Angular ESLint (GAP-1.1)

**Severity:** High | **Effort:** Small

Install and configure ESLint with Angular-specific rules. Add `lint` script to `package.json` and integrate with pre-commit hooks via lint-staged.

**Devin Prompt:**

```
Add ESLint to ts-angular-realworld-example-app. Install @angular-eslint/schematics and configure
it for standalone components. Use the recommended rule set. Add an "ng lint" script to package.json
and add ESLint to the lint-staged configuration in package.json so it runs on pre-commit alongside
Prettier. Fix any lint errors that appear. Open a PR with the configuration and fixes.
```

---

### 1.2 Add Code Coverage Reporting (GAP-3.2)

**Severity:** Medium | **Effort:** Small

Install `@vitest/coverage-v8`, configure coverage thresholds, and add a `test:coverage` script.

**Devin Prompt:**

```
Add code coverage reporting to ts-angular-realworld-example-app. Install @vitest/coverage-v8,
configure vitest.config.ts to collect coverage with thresholds (statements: 50%, branches: 50%,
functions: 50%, lines: 50%), and add a "test:coverage" script to package.json. Run the coverage
report and include the output summary in the PR description. Open a PR.
```

---

### 1.3 Centralize Constants and Configuration (GAP-1.3)

**Severity:** Medium | **Effort:** Small

Extract magic strings and numbers into a shared constants file.

**Devin Prompt:**

```
Create a shared constants file at src/app/core/constants.ts in ts-angular-realworld-example-app.
Extract the following into named constants: the localStorage key 'jwtToken' (used in JwtService),
default pagination limit and offset values, and the Authorization header prefix 'Token'. Update all
files that reference these values to import from the constants file. Run tests to verify nothing
breaks. Open a PR.
```

---

### 1.4 Add HTTP Retry and Timeout Logic (GAP-2.3)

**Severity:** Medium | **Effort:** Small

Add RxJS `retry` and `timeout` operators to HTTP calls for transient failure resilience.

**Devin Prompt:**

```
Add a new HTTP interceptor called resilience.interceptor.ts in ts-angular-realworld-example-app
at src/app/core/interceptors/. The interceptor should apply RxJS timeout(10000) and retry(1) to
all GET requests (skip retry for mutating methods). Register it in app.config.ts after the existing
interceptors. Add unit tests for the interceptor. Open a PR.
```

---

### 1.5 Harden Markdown Rendering (GAP-4.2)

**Severity:** Medium | **Effort:** Small

Replace `bypassSecurityTrustHtml` with a proper sanitization library.

**Devin Prompt:**

```
Improve XSS protection in the MarkdownPipe of ts-angular-realworld-example-app. Install DOMPurify
(@types/dompurify + dompurify) and update markdown.pipe.ts to sanitize the HTML output from marked
through DOMPurify before passing it to Angular's sanitizer. Remove the bypassSecurityTrustHtml call.
Add unit tests that verify script tags and event handlers are stripped from markdown output. Open a PR.
```

---

### 1.6 Add Content Security Policy (GAP-4.3)

**Severity:** Medium | **Effort:** Small

Add a CSP meta tag and SRI hashes for external resources.

**Devin Prompt:**

```
Add a Content Security Policy to ts-angular-realworld-example-app. Add a <meta> CSP tag in
index.html that allows scripts from 'self', styles from 'self' and the Google Fonts / Ionicons CDNs,
and connects to the API URL. Add integrity attributes (SRI hashes) to the external CSS <link> tags.
Verify the app still loads correctly. Open a PR.
```

---

## Phase 2 — Important Improvements (High-Medium Impact, Medium Effort)

Items that significantly improve reliability, security, and developer experience.

### 2.1 Expand Error Interceptor Coverage (GAP-2.1)

**Severity:** High | **Effort:** Medium

Extend the error interceptor to handle 403, 404, 422, and 500 errors with structured responses.

**Devin Prompt:**

```
Improve error handling in ts-angular-realworld-example-app. Update error.interceptor.ts to handle
these HTTP status codes with specific behavior:
- 401: purge auth (already implemented)
- 403: emit a structured error with message "You don't have permission to perform this action"
- 404: emit a structured error with message "The requested resource was not found"
- 422: parse the validation errors from the response body into the Errors format
- 500+: emit a structured error with message "An unexpected server error occurred"

Create a shared HttpErrorResponse model. Update ListErrorsComponent to display these structured
errors. Add unit tests for each status code path. Open a PR.
```

---

### 2.2 Add Global Error Handler (GAP-2.2)

**Severity:** Medium | **Effort:** Medium

Implement a custom Angular `ErrorHandler` that catches unhandled errors and displays user-friendly feedback.

**Devin Prompt:**

```
Add a global error handler to ts-angular-realworld-example-app. Create a custom ErrorHandler class
at src/app/core/error-handler/global-error-handler.ts that:
1. Catches all unhandled errors
2. Logs them to console with structured metadata (timestamp, component, message, stack)
3. Shows a toast/notification to the user for critical errors
4. Swallows expected errors (like NavigationCancel) gracefully

Register it as a provider in app.config.ts. Add unit tests. Open a PR.
```

---

### 2.3 Add Client-Side Form Validation (GAP-4.4)

**Severity:** Medium | **Effort:** Medium

Add Angular Validators to all form controls across auth, editor, and settings components.

**Devin Prompt:**

```
Add client-side form validation to all forms in ts-angular-realworld-example-app:

1. AuthComponent (login): required + email format on email, required + minLength(8) on password
2. AuthComponent (register): required on username, required + email on email, required + minLength(8)
   on password
3. EditorComponent: required on title and body, required on description
4. SettingsComponent: required + email on email, URL format on image field

Display validation errors below each field using the existing ListErrorsComponent pattern or inline
error messages. Disable the submit button when the form is invalid. Add unit tests for each form's
validation. Open a PR.
```

---

### 2.4 Add Loading and Error States to Views (GAP-7.1)

**Severity:** High | **Effort:** Medium

Implement consistent loading indicators and error fallbacks across data-dependent components.

**Devin Prompt:**

```
Add loading and error states to all data-dependent views in ts-angular-realworld-example-app.

1. Create a shared LoadingSpinnerComponent at src/app/shared/components/
2. Create a shared ErrorStateComponent that displays a message and retry button
3. Update these components to show loading/error/empty states:
   - HomeComponent (article list, tags sidebar)
   - ArticleComponent (article detail, comments)
   - ProfileComponent (user info, article list)
4. Use the existing LoadingState enum consistently across all components

Add unit tests for the shared components. Open a PR.
```

---

### 2.5 Add CI Pipeline with GitHub Actions (GAP-3.3)

**Severity:** Medium | **Effort:** Medium

Create a GitHub Actions workflow that runs formatting checks, unit tests, and optionally E2E tests.

**Devin Prompt:**

```
Create a GitHub Actions CI workflow for ts-angular-realworld-example-app at
.github/workflows/ci.yml. The workflow should:
1. Trigger on push to main and on pull requests
2. Use Bun for package management
3. Run: bun install, bun run format:check, bun run test
4. Cache bun dependencies for faster builds
5. Add a badge to the README showing CI status

Open a PR with the workflow file and README update.
```

---

### 2.6 Add Runtime Response Validation (GAP-5.2)

**Severity:** Medium | **Effort:** Medium

Add Zod schemas to validate API responses at runtime and surface clear errors for unexpected shapes.

**Devin Prompt:**

```
Add runtime API response validation to ts-angular-realworld-example-app. Install Zod and create
schemas at src/app/core/schemas/ for: User, Article, Profile, Comment, and the list response
wrappers (articles + articlesCount, etc.). Create a validation utility that validates responses
against schemas and throws descriptive errors for mismatches. Apply validation in the service layer
(ArticlesService, UserService, CommentsService, ProfileService). Add unit tests with valid and
invalid response fixtures. Open a PR.
```

---

## Phase 3 — Polish and Hardening (Lower Priority, Variable Effort)

Items that improve the application's production readiness and developer experience.

### 3.1 Migrate JWT Storage to Secure Alternative (GAP-4.1)

**Severity:** High | **Effort:** Medium

Replace localStorage JWT storage with a more secure approach. Note: this may require backend changes for httpOnly cookies.

**Devin Prompt:**

```
Improve JWT security in ts-angular-realworld-example-app. Refactor JwtService to store the JWT
in memory (a private class field) instead of localStorage. Add a note in the README that for
production use, tokens should be managed via httpOnly cookies set by the backend. Update
user.service.ts to handle token refresh on page reload by attempting GET /user on app init —
if it fails, redirect to login. Update all existing tests. Open a PR.
```

---

### 3.2 Add Component-Level Unit Tests (GAP-3.1)

**Severity:** High | **Effort:** Large

Write unit tests for all components, pipes, directives, and guards.

**Devin Prompt:**

```
Add comprehensive component unit tests to ts-angular-realworld-example-app. Write Vitest specs for:

Priority 1 (core):
- HeaderComponent — renders correct nav links for authenticated vs unauthenticated users
- AuthComponent — renders login vs register form, submits credentials, displays errors
- AuthGuard — redirects unauthenticated users, allows authenticated users

Priority 2 (features):
- HomeComponent — switches between global/feed tabs, filters by tag
- ArticleListComponent — renders articles, handles pagination
- ArticlePreviewComponent — displays article data, handles favorite toggle
- EditorComponent — create vs edit mode, form submission
- SettingsComponent — form rendering, submit, logout

Priority 3 (shared):
- MarkdownPipe — renders markdown, handles edge cases
- ImageFallbackPipe — returns fallback for null/empty URLs
- ListErrorsComponent — renders error messages from Errors object
- ShowAuthedDirective — shows/hides content based on auth state

Use Angular TestBed with Vitest. Mock services and HTTP calls. Open a PR.
```

---

### 3.3 Add Structured Logging (GAP-6.1)

**Severity:** Medium | **Effort:** Medium

Implement a logging service with structured output and severity levels.

**Devin Prompt:**

```
Add structured logging to ts-angular-realworld-example-app. Create a LoggerService at
src/app/core/services/logger.service.ts with methods: debug(), info(), warn(), error(). Each
method should output structured JSON to the console with fields: timestamp, level, message, context
(optional), and data (optional). Add the logger to: error.interceptor.ts (log all HTTP errors),
UserService (log auth events), and the global error handler. In production builds, suppress debug
and info levels. Add unit tests. Open a PR.
```

---

### 3.4 Standardize Injection Pattern (GAP-1.2)

**Severity:** Low | **Effort:** Small

Migrate all constructor-based injection to the `inject()` function pattern.

**Devin Prompt:**

```
Standardize dependency injection in ts-angular-realworld-example-app to use the inject() function
everywhere. Find all components, services, and guards that use constructor injection and refactor
them to use inject() instead. This is a mechanical refactor — do not change any behavior. Run all
tests to verify nothing breaks. Open a PR.
```

---

### 3.5 Add Performance Monitoring (GAP-6.3)

**Severity:** Low | **Effort:** Medium

Add Web Vitals tracking and basic Angular performance metrics.

**Devin Prompt:**

```
Add performance monitoring to ts-angular-realworld-example-app. Install the web-vitals library
and create a PerformanceService at src/app/core/services/performance.service.ts that captures
CLS, FID, FCP, LCP, and TTFB. Log metrics to the console in development. Add Angular-specific
tracking for route navigation timing using Router events. Open a PR.
```

---

### 3.6 Add PWA Support (GAP-7.2)

**Severity:** Low | **Effort:** Large

Add Service Worker and PWA manifest for offline support and installability.

**Devin Prompt:**

```
Add PWA support to ts-angular-realworld-example-app. Run ng add @angular/pwa to install the
service worker package and generate the manifest. Configure ngsw-config.json to cache: the app
shell (index.html, JS, CSS), external fonts and icons (CDN resources), and API responses for
/articles and /tags with a network-first strategy. Add a fallback offline page. Verify the app
works offline for previously visited pages. Open a PR.
```

---

## Phase Summary

| Phase       | Items   | Total Effort | Key Outcomes                                                                      |
| ----------- | ------- | ------------ | --------------------------------------------------------------------------------- |
| **Phase 1** | 6 items | ~1-2 days    | Linting, coverage, constants, retry logic, XSS hardening, CSP                     |
| **Phase 2** | 6 items | ~3-5 days    | Error handling, form validation, loading states, CI pipeline, runtime validation  |
| **Phase 3** | 6 items | ~5-8 days    | Secure JWT, comprehensive tests, logging, injection consistency, performance, PWA |

---

## Execution Notes

- **Phase 1** items can be executed in parallel as separate Devin sessions — they have no dependencies on each other.
- **Phase 2** items should be executed after Phase 1 (especially GAP-2.1 depends on having the error model established).
- **Phase 3** items are independent of each other but assume Phase 1 and 2 are complete.
- Each Devin prompt above is self-contained and ready to paste into a new Devin session.
- After each PR, review the changes and leave comments to refine — Devin will respond and push follow-up commits.
