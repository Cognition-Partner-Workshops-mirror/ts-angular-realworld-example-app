# Remediation Roadmap — Angular RealWorld Example App (Conduit)

Prioritized into three phases based on severity and effort. Each item includes an actionable Devin prompt.

---

## Phase 1 — Quick Wins (High Severity / Small-Medium Effort)

These items address the most impactful gaps with relatively low implementation cost.

### 1.1 Add ESLint with Angular ESLint Rules

**Gap**: 1.3 — No linting for Angular best practices or code smells.
**Severity**: High | **Effort**: Medium

```
Add ESLint to this Angular project:
1. Install @angular-eslint/schematics and configure with `ng add @angular-eslint/schematics`
2. Add recommended rules for Angular best practices
3. Add a "lint" script to package.json: "lint": "ng lint"
4. Fix any auto-fixable violations
5. Add lint to the pre-commit hook alongside prettier
```

---

### 1.2 Add Retry Logic for Non-Auth API Calls

**Gap**: 7.1 — Article/comment/tag fetches fail immediately with no retry.
**Severity**: High | **Effort**: Medium

```
Add retry-with-backoff to HTTP requests in this Angular app:
1. Create a new RxJS operator in src/app/core/interceptors/ called retry.interceptor.ts
2. Implement retry logic: retry up to 2 times with 1s delay on 5XX/network errors only
3. Skip retries for 4XX errors (client errors should not be retried)
4. Skip retries for mutation requests (POST/PUT/DELETE) to avoid duplicates
5. Register the interceptor in app.config.ts after errorInterceptor
6. Add unit tests for the retry logic
```

---

### 1.3 Add Structured Logging

**Gap**: 6.1 — No logging framework; only console.error in bootstrap.
**Severity**: High | **Effort**: Medium

```
Add structured logging to this Angular app:
1. Create a LoggerService in src/app/core/services/logger.service.ts
2. Support log levels: debug, info, warn, error
3. Include structured metadata (timestamp, component name, context)
4. Replace all console.log/error calls with LoggerService
5. Add a global Angular ErrorHandler that logs uncaught errors
6. Make it configurable so production can send logs to an external service
7. Add unit tests for the LoggerService
```

---

### 1.4 Add Content Security Policy

**Gap**: 4.1 — No CSP headers; external CDN resources load without integrity checks.
**Severity**: High | **Effort**: Medium

```
Add Content Security Policy to this Angular app:
1. Add a CSP meta tag to src/index.html with:
   - default-src 'self'
   - script-src 'self'
   - style-src 'self' 'unsafe-inline' fonts.googleapis.com code.ionicframework.com
   - font-src fonts.gstatic.com
   - img-src 'self' https: data:
   - connect-src 'self' api.realworld.show
2. Add Subresource Integrity (SRI) hashes to CDN link tags where supported
3. Verify the app still works correctly with CSP enabled
4. Document the CSP policy in the README
```

---

### 1.5 Fix Silent Error Swallowing

**Gap**: 2.2 — FavoriteButton and FollowButton catch errors silently.
**Severity**: Medium | **Effort**: Small

```
Fix silent error handling in FavoriteButtonComponent and FollowButtonComponent:
1. In src/app/features/article/components/favorite-button.component.ts:
   - Add an @Output() error EventEmitter
   - In the error handler, emit the error so parent components can display it
   - Alternatively, inject a toast/notification service to show inline feedback
2. In src/app/features/profile/components/follow-button.component.ts:
   - Apply the same pattern as above
3. Add unit tests verifying errors are properly emitted/displayed
```

---

### 1.6 Add Path Aliases

**Gap**: 1.1 — Deep relative imports hurt readability.
**Severity**: Medium | **Effort**: Small

```
Configure TypeScript path aliases for this Angular app:
1. In tsconfig.json, add paths:
   "@app/core/*": ["src/app/core/*"]
   "@app/features/*": ["src/app/features/*"]
   "@app/shared/*": ["src/app/shared/*"]
2. Update tsconfig.app.json and tsconfig.spec.json to inherit these paths
3. Update vitest.config.ts resolve.alias to match
4. Refactor all deep relative imports (../../../../) to use aliases
5. Verify build, tests, and IDE navigation still work
```

---

### 1.7 Add Test Coverage Thresholds

**Gap**: 3.2 — No minimum coverage enforcement.
**Severity**: Medium | **Effort**: Small

```
Add test coverage thresholds to this Angular project:
1. In vitest.config.ts, add coverage thresholds:
   coverage: {
     thresholds: {
       statements: 60,
       branches: 60,
       functions: 60,
       lines: 60,
     }
   }
2. Run "bun run test:coverage" to verify current coverage meets thresholds
3. Adjust thresholds to be slightly below current coverage (ratchet pattern)
4. Add "test:coverage" to CI pipeline documentation
```

---

### 1.8 Fix @ts-ignore in ArticlesService

**Gap**: 1.4 — Type suppression for filter iteration.
**Severity**: Medium | **Effort**: Small

```
Fix the @ts-ignore in src/app/features/article/services/articles.service.ts:
1. Replace the Object.keys loop (lines 16-19) with properly typed access:
   - Use (Object.keys(config.filters) as Array<keyof typeof config.filters>)
   - Or iterate with Object.entries and type the value
2. Remove the @ts-ignore comment
3. Verify the query method still works correctly with all filter combinations
4. Run existing unit tests to confirm no regressions
```

---

### 1.9 Add Dependency Vulnerability Scanning

**Gap**: 4.6 — No automated CVE detection.
**Severity**: Medium | **Effort**: Small

```
Set up dependency vulnerability scanning:
1. Add a GitHub Actions workflow (.github/workflows/security.yml) that:
   - Runs "bun audit" or "npm audit" on push/PR
   - Fails the build on high/critical vulnerabilities
2. Add a Renovate or Dependabot configuration for automated dependency updates
3. Run an initial audit and document any existing vulnerabilities
4. Add the audit command to the README
```

---

### 1.10 Add HTTP Request Timeouts

**Gap**: 7.2 — No explicit timeout; hung connections leave UI in loading state.
**Severity**: Medium | **Effort**: Small

```
Add HTTP request timeouts to this Angular app:
1. Create a timeout interceptor in src/app/core/interceptors/timeout.interceptor.ts
2. Set a default timeout of 15 seconds for all requests
3. Allow individual requests to override via a custom header or HttpContext token
4. On timeout, throw a user-friendly error that the error interceptor can normalize
5. Register in app.config.ts interceptor chain
6. Add unit tests
```

---

## Phase 2 — Important (High Severity / Large Effort or Medium Severity / Medium Effort)

These items require more effort but significantly improve quality.

### 2.1 Add Component Unit Tests

**Gap**: 3.1 — Zero unit tests for any component.
**Severity**: High | **Effort**: Large

```
Add unit tests for Angular components in this project:
1. Start with the most critical components:
   - src/app/core/auth/auth.component.ts (login/register form)
   - src/app/features/article/pages/home/home.component.ts (feed selection)
   - src/app/features/article/pages/editor/editor.component.ts (create/edit)
2. Use Vitest with Angular TestBed (match existing service test patterns)
3. Test:
   - Component creation and initial state
   - Form validation behavior
   - User interactions (submit, navigation)
   - Error state display
4. Add at least 3-5 tests per component
5. Ensure coverage thresholds still pass
```

---

### 2.2 Add Interceptor Unit Tests

**Gap**: 3.3 — No dedicated tests for the three interceptors.
**Severity**: Medium | **Effort**: Medium

```
Add unit tests for HTTP interceptors:
1. Create src/app/core/interceptors/api.interceptor.spec.ts:
   - Verify URL prefix is added correctly
   - Verify absolute URLs are handled
2. Create src/app/core/interceptors/token.interceptor.spec.ts:
   - Verify token is attached when available
   - Verify no Authorization header when no token
3. Create src/app/core/interceptors/error.interceptor.spec.ts:
   - Verify 401 on non-/user endpoint triggers purgeAuth
   - Verify 401 on /user endpoint does NOT trigger purgeAuth
   - Verify error normalization format
4. Use HttpClientTestingModule pattern from existing tests
```

---

### 2.3 Add Global Error Boundary

**Gap**: 2.1 — No ErrorHandler override or UI recovery.
**Severity**: Medium | **Effort**: Medium

```
Add a global error handler to this Angular app:
1. Create src/app/core/services/global-error-handler.ts implementing ErrorHandler
2. Log errors to the LoggerService (from 1.3)
3. For rendering errors, show a user-friendly fallback notification
4. For HTTP errors already handled by interceptor, skip duplicate handling
5. Register as a provider in app.config.ts: { provide: ErrorHandler, useClass: GlobalErrorHandler }
6. Add unit tests
```

---

### 2.4 Add Runtime API Response Validation

**Gap**: 5.3 — No runtime validation to catch API contract drift.
**Severity**: Medium | **Effort**: Medium

```
Add runtime response validation to API services:
1. Install Zod: bun add zod
2. Create schema files in src/app/core/schemas/:
   - user.schema.ts (UserSchema, ProfileSchema)
   - article.schema.ts (ArticleSchema, CommentSchema)
3. Add a validation utility that parses API responses through schemas
4. In development mode, log warnings for schema mismatches
5. In production mode, pass through gracefully (don't break the app)
6. Add unit tests for each schema
```

---

### 2.5 Add Input Validation

**Gap**: 4.3 — Forms only check for non-empty.
**Severity**: Medium | **Effort**: Small

```
Improve form validation in this Angular app:
1. In auth.component.ts registration form, add:
   - Validators.email on email field
   - Validators.minLength(8) on password field
   - Validators.minLength(3) and Validators.maxLength(20) on username
2. In auth.component.ts login form, add:
   - Validators.email on email field
3. In settings.component.ts, add:
   - Validators.email on email field
   - URL pattern validator on image field
4. Add user-facing validation error messages in templates
5. Add unit tests for validation behavior
```

---

### 2.6 Add Performance Monitoring

**Gap**: 6.2 — No Web Vitals or runtime performance tracking.
**Severity**: Medium | **Effort**: Medium

```
Add Web Vitals performance monitoring:
1. Install web-vitals: bun add web-vitals
2. Create src/app/core/services/performance.service.ts
3. Track CLS, FID, FCP, LCP, TTFB metrics
4. Log metrics in development, report to analytics in production
5. Add a Lighthouse CI config for automated performance budgets
6. Document performance baselines in README
```

---

### 2.7 Add Error Reporting Service Integration

**Gap**: 2.3 / 6.5 — Errors only logged to console.
**Severity**: Medium | **Effort**: Medium

```
Integrate an error reporting service:
1. Create an abstract ErrorReporter interface in src/app/core/services/
2. Implement a ConsoleErrorReporter (default/development)
3. Implement a SentryErrorReporter (production) with:
   - Automatic error capture
   - User context attachment (username, email)
   - Environment tagging
4. Configure via environment files
5. Wire into the GlobalErrorHandler from 2.3
6. Document setup instructions for Sentry DSN in README
```

---

## Phase 3 — Polish (Low Severity or Large Effort)

These items improve overall quality but are lower priority.

### 3.1 Enable Cross-Browser E2E Testing

**Gap**: 3.5 — Only Chromium tested.
**Severity**: Low | **Effort**: Small

```
Enable cross-browser E2E testing:
1. In playwright.config.ts, uncomment the Firefox and WebKit projects
2. Run the full E2E suite across all three browsers
3. Fix any browser-specific failures
4. Add a CI matrix that runs each browser in parallel
5. Document known browser-specific limitations
```

---

### 3.2 Add Offline Support / Service Worker

**Gap**: 7.3 — No offline detection or caching strategy.
**Severity**: Medium | **Effort**: Large

```
Add offline support with a service worker:
1. Run: ng add @angular/pwa
2. Configure ngsw-config.json with:
   - App shell caching (index.html, main.js, styles.css)
   - API response caching with network-first strategy
   - Image caching with cache-first strategy
3. Add offline detection in the header component
4. Show "You're offline" banner when network is unavailable
5. Queue failed mutations for retry when back online
6. Add E2E tests for offline scenarios
```

---

### 3.3 Unify Signal/Observable Pattern

**Gap**: 1.5 — Mixed signal and async pipe patterns.
**Severity**: Low | **Effort**: Large

```
Unify state management to use Angular Signals throughout:
1. Convert service observables to signal-based APIs using toSignal()
2. Replace AsyncPipe usage in templates with signal reads
3. Prioritize core services: UserService.currentUser, UserService.authState
4. Update HeaderComponent, ArticleCommentComponent to use signals
5. Keep RxJS for HTTP calls and complex async flows
6. Update all affected unit and E2E tests
```

---

### 3.4 Add Barrel Exports

**Gap**: 1.2 — No index.ts files in feature folders.
**Severity**: Low | **Effort**: Small

```
Add barrel (index.ts) exports to feature modules:
1. Create src/app/core/index.ts exporting public API
2. Create src/app/features/article/index.ts
3. Create src/app/features/profile/index.ts
4. Create src/app/shared/index.ts
5. Update imports throughout the app to use barrel paths
6. Verify build still works and no circular dependencies exist
```

---

### 3.5 Add Optimistic Updates

**Gap**: 7.4 — Favorite/follow wait for server before updating UI.
**Severity**: Low | **Effort**: Medium

```
Implement optimistic updates for favorite and follow actions:
1. In FavoriteButtonComponent:
   - Immediately toggle favorited state and increment/decrement count
   - On error, revert to previous state and show error notification
2. In FollowButtonComponent:
   - Immediately toggle following state
   - On error, revert and notify
3. Add unit tests for optimistic update + rollback behavior
4. Add E2E test verifying rollback on network failure
```

---

### 3.6 Add Request Deduplication

**Gap**: 7.5 — Rapid clicks can fire overlapping requests.
**Severity**: Low | **Effort**: Medium

```
Add request deduplication for this Angular app:
1. In ArticleListComponent.runQuery():
   - Use switchMap or cancel previous request when new one starts
   - Add a loading debounce of 200ms for pagination clicks
2. In ProfileService.get():
   - shareReplay(1) is already used; add a cache invalidation strategy
3. Add AbortController-based cancellation via HttpContext token
4. Verify with E2E test that rapid pagination doesn't cause stale data display
```

---

### 3.7 Add OpenAPI Documentation

**Gap**: 5.1 — API surface only documented in service code.
**Severity**: Medium | **Effort**: Medium

```
Generate OpenAPI documentation for the API surface:
1. Create docs/api/openapi.yaml describing all endpoints used by this frontend
2. Document request/response schemas matching TypeScript interfaces
3. Include authentication requirements (Token header)
4. Add pagination query parameter documentation
5. Consider generating TypeScript types from OpenAPI spec in the future
```

---

## Phase Summary

| Phase   | Items    | Focus                                                           |
| ------- | -------- | --------------------------------------------------------------- |
| Phase 1 | 10 items | Linting, retries, logging, CSP, error handling, types, scanning |
| Phase 2 | 7 items  | Component tests, interceptor tests, validation, monitoring      |
| Phase 3 | 7 items  | Cross-browser, offline, signal migration, deduplication         |

---

## Recommended Execution Order

1. **1.8** Fix `@ts-ignore` (trivial, instant win)
2. **1.6** Path aliases (improves DX for all subsequent work)
3. **1.1** ESLint (catches issues in all subsequent PRs)
4. **1.5** Fix silent errors (quick UX win)
5. **1.10** Request timeouts (simple interceptor)
6. **1.7** Coverage thresholds (prevents regression)
7. **1.9** Vulnerability scanning (security baseline)
8. **1.4** CSP headers (security)
9. **1.3** Structured logging (observability foundation)
10. **1.2** Retry logic (resilience)
11. **Phase 2** items in listed order
12. **Phase 3** items as capacity allows
