# Remediation Roadmap

## ts-angular-realworld-example-app

> Phased plan to address the 29 engineering gaps identified in the Gap Analysis. Each item includes an actionable Devin prompt referencing specific files, classes, methods, and line numbers.

---

## Phase 1: Quick Wins (1-2 Weeks)

> High severity + Small effort, plus select Medium severity + Small effort items that are fast to fix.

### 1.1 Fix Article List Error Recovery (GAP-RES-01)

**Severity:** High | **Effort:** Small

Add error handling to `ArticleListComponent.runQuery()` so a failed API call transitions from `LOADING` to an error state with a retry button.

**Devin Prompt:**

```
In src/app/features/article/components/article-list.component.ts, modify the runQuery() method (line 111-133).
Add an error signal: `error = signal<string | null>(null);`
In the subscribe() call at line 124, add an error handler that sets loading to LoadingState.LOADED,
sets results to an empty array, and sets error to a user-friendly message like "Failed to load articles. Please try again."
Also reset the error signal to null at the start of runQuery() (line 112).
In the template (lines 24-54), add an @if block after the LOADED check that displays the error message
with a retry button calling runQuery(). Add comments explaining the error recovery flow.
```

### 1.2 Extract API Base URL to Environment Configuration (GAP-SEC-01)

**Severity:** High | **Effort:** Small

Replace the hardcoded API URL with an environment-driven configuration using Angular's `environment.ts` pattern or an injection token.

**Devin Prompt:**

```
Create src/environments/environment.ts with: export const environment = { apiUrl: 'https://api.realworld.show/api' };
Create src/environments/environment.development.ts with the same content but pointing to a local or dev URL.
In src/app/core/interceptors/api.interceptor.ts (line 2), replace the hardcoded URL string
'https://api.realworld.show/api' with the imported environment.apiUrl.
Update angular.json to configure fileReplacements for the development configuration.
Add a comment in the interceptor explaining the environment-based URL injection.
```

### 1.3 Fix `@ts-ignore` in ArticlesService (GAP-ORG-01)

**Severity:** Medium | **Effort:** Small

Replace the `@ts-ignore` with properly typed filter iteration.

**Devin Prompt:**

```
In src/app/features/article/services/articles.service.ts, refactor the query() method (lines 16-19).
Remove the @ts-ignore comment and replace the Object.keys iteration with a type-safe approach.
Use: Object.entries(config.filters).forEach(([key, value]) => { if (value !== undefined) { params = params.set(key, String(value)); } });
This properly handles the ArticleListConfig.filters type without suppressing TypeScript checks.
Add a comment explaining the type-safe filter parameter construction.
```

### 1.4 Add Error Handling to deleteArticle() (GAP-RES-05)

**Severity:** Medium | **Effort:** Small

Add error handling to the article deletion flow.

**Devin Prompt:**

```
In src/app/features/article/pages/article/article.component.ts, modify deleteArticle() (lines 107-119).
Add an error handler to the subscribe() call that:
1. Sets isDeleting back to false
2. Sets an error signal to display the failure to the user
Use the existing errors signal (line 50) to display the error via the existing ListErrorsComponent.
Add a comment explaining the error recovery behavior for failed deletions.
```

### 1.5 Add User Feedback to Favorite/Follow Error States (GAP-ERR-02)

**Severity:** Medium | **Effort:** Small

Show error feedback when favorite/follow API calls fail.

**Devin Prompt:**

```
In src/app/features/article/components/favorite-button.component.ts (line 74),
and src/app/features/profile/components/follow-button.component.ts (line 76),
modify the error handlers in the subscribe() calls.
Add an error signal to each component: `error = signal<string | null>(null);`
In the error callback, set the error signal to a user-friendly message.
Add a small error tooltip or visual indicator (e.g., red border flash) in each component's template.
Clear the error after 3 seconds using setTimeout.
Add comments explaining the transient error display approach.
```

### 1.6 Add HTTP Request Timeout (GAP-RES-03)

**Severity:** Medium | **Effort:** Small

Configure a global timeout for HTTP requests.

**Devin Prompt:**

```
In src/app/core/interceptors/api.interceptor.ts, add a timeout operator to the interceptor chain.
Import { timeout } from 'rxjs/operators' and { TimeoutError } from 'rxjs'.
After cloning the request with the API base URL, pipe the next(apiReq) response through
timeout(15000) to set a 15-second timeout on all API requests.
Add a catchError that converts TimeoutError to a user-friendly error format matching the app's
Errors interface ({ errors: { network: 'Request timed out. Please try again.' }, status: 0 }).
Add a comment explaining the global timeout strategy and the chosen 15s threshold.
```

### 1.7 Fix Duplicate Import in ProfileComponent (GAP-ORG-03)

**Severity:** Low | **Effort:** Small

Remove the duplicate `FollowButtonComponent` import.

**Devin Prompt:**

```
In src/app/features/profile/pages/profile/profile.component.ts, remove the duplicate
FollowButtonComponent from the imports array (line 22). Keep the first occurrence at line 18.
The imports array should list FollowButtonComponent only once.
```

### 1.8 Fix UntypedFormGroup Usage (GAP-ORG-02)

**Severity:** Low | **Effort:** Small

Replace `UntypedFormGroup` with the properly typed `FormGroup<ArticleForm>`.

**Devin Prompt:**

```
In src/app/features/article/pages/editor/editor.component.ts (line 25), change the type annotation
from `UntypedFormGroup` to `FormGroup<ArticleForm>`.
Remove the import of `UntypedFormGroup` from '@angular/forms' (line 2) if it's no longer used elsewhere.
Add a comment noting the typed form group for article editing.
```

### 1.9 Fix Email Input Type (GAP-SEC-05)

**Severity:** Low | **Effort:** Small

Use proper HTML5 email input type.

**Devin Prompt:**

```
In src/app/core/auth/auth.component.html (line 29), change type="text" to type="email"
on the email input field. This enables browser-native email validation and improves
mobile keyboard experience.
Add a comment in the template noting the semantic input type for email validation.
```

### 1.10 Fix Inconsistent Trailing Slash (GAP-API-03)

**Severity:** Low | **Effort:** Small

Normalize endpoint paths.

**Devin Prompt:**

```
In src/app/features/article/services/articles.service.ts (line 36), change '/articles/'
to '/articles' (remove trailing slash) in the create() method's POST URL.
This makes it consistent with all other endpoint paths in the application.
```

### 1.11 Tighten Error Interceptor URL Check (GAP-ERR-04)

**Severity:** Medium | **Effort:** Small

Make the `/user` endpoint check more specific.

**Devin Prompt:**

```
In src/app/core/interceptors/error.interceptor.ts, update the URL check that skips 401
handling for the /user endpoint. Instead of checking if the URL ends with '/user',
check if the URL path matches exactly '/user' (not '/profiles/user' or similar).
Use a more precise regex or path comparison: req.url === '/user' || req.url.startsWith('/user?').
Add a comment explaining why the /user endpoint has special error handling
(4XX vs 5XX distinction for auth validation).
```

### 1.12 Add Content Security Policy (GAP-SEC-03)

**Severity:** Medium | **Effort:** Small

Add a basic CSP meta tag.

**Devin Prompt:**

```
In src/index.html, add a Content-Security-Policy meta tag in the <head> section.
Set: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
img-src 'self' https: data:; connect-src 'self' https://api.realworld.show;
font-src 'self' https://unpkg.com https://fonts.googleapis.com https://fonts.gstatic.com;
Adjust as needed for any CDN resources used by the app's stylesheets.
Add a comment explaining each CSP directive and its purpose.
```

---

## Phase 2: Important (3-6 Weeks)

> High severity + Medium effort, plus structurally important Medium severity items.

### 2.1 Add Comprehensive Error Handling to All Components (GAP-ERR-01)

**Severity:** High | **Effort:** Medium

Standardize error handling across all data-loading components.

**Devin Prompt:**

```
Add error handling to these components that currently have none:

1. src/app/features/article/components/article-list.component.ts - runQuery() at line 121:
   Add error handler to subscribe() that sets loading to LOADED, results to [], and displays error.

2. src/app/features/profile/components/profile-articles.component.ts - ngOnInit() at line 28:
   Add catchError or error handler to the profileService.get() subscription.
   Add an errors signal and display via ListErrorsComponent.

3. src/app/features/profile/components/profile-favorites.component.ts - ngOnInit() at line 28:
   Same pattern as profile-articles.

4. src/app/features/article/pages/home/home.component.ts - ngOnInit() at line 42:
   Add catchError to the combineLatest subscription for auth/route params.

For each component, follow the pattern established in ArticleComponent.ngOnInit() (line 72):
use catchError to capture errors into a signal, display via ListErrorsComponent, and return EMPTY.
Add comments explaining the error handling strategy in each modified component.
```

### 2.2 Add Interceptor Unit Tests (GAP-TST-02)

**Severity:** High | **Effort:** Medium

Create unit tests for all three HTTP interceptors.

**Devin Prompt:**

```
Create three test files:

1. src/app/core/interceptors/api.interceptor.spec.ts:
   - Test that requests are prefixed with the API base URL
   - Test that the original request URL is preserved after the prefix
   - Test various URL patterns (with/without leading slash)

2. src/app/core/interceptors/token.interceptor.spec.ts:
   - Test that Authorization header is added when token exists
   - Test that no Authorization header is added when no token
   - Test the header format is "Token <jwt>"

3. src/app/core/interceptors/error.interceptor.spec.ts:
   - Test that 401 errors on non-/user endpoints call purgeAuth()
   - Test that 401 errors on /user endpoint do NOT call purgeAuth()
   - Test error normalization format { errors: {...}, status: number }
   - Test network error handling (status 0)

Use the same testing patterns as existing spec files (Vitest + Angular TestBed + HttpTestingController).
Add zone.js imports and TestBed initialization matching the existing test conventions.
Add comments explaining each test case and what interceptor behavior it validates.
```

### 2.3 Add Global ErrorHandler (GAP-ERR-03)

**Severity:** Medium | **Effort:** Medium

Implement a custom Angular ErrorHandler for unhandled exceptions.

**Devin Prompt:**

```
Create src/app/core/services/global-error-handler.ts:
- Implement Angular's ErrorHandler interface
- Log errors with structured format: { timestamp, message, stack, url }
- For HttpErrorResponse instances, include status code and URL
- Use console.error for now (can be replaced with a monitoring service later)
- Optionally show a toast/notification for critical errors

Register it in src/app/app.config.ts by adding to the providers array:
{ provide: ErrorHandler, useClass: GlobalErrorHandler }

Add comments explaining the global error handling strategy and how to extend it
with external monitoring services (e.g., Sentry, Datadog RUM).
```

### 2.4 Add Structured Logging Service (GAP-OBS-01)

**Severity:** High | **Effort:** Medium

Create a centralized logging service.

**Devin Prompt:**

```
Create src/app/core/services/logger.service.ts:
- Injectable service with methods: debug(), info(), warn(), error()
- Each method accepts a message string and optional context object
- Structured output format: { level, timestamp, message, context }
- In development mode (isDevMode()), log to console
- In production, could be extended to send to a remote logging endpoint

Integrate the logger into key locations:
- src/app/core/auth/services/user.service.ts: log auth state transitions, retry attempts
- src/app/core/interceptors/error.interceptor.ts: log HTTP errors with URL and status
- src/app/app.config.ts: log app initialization and auth bootstrap

Add comments explaining the logging levels, structured format, and extension points.
```

### 2.5 Add Form Validation to Editor and Settings (GAP-SEC-04)

**Severity:** Medium | **Effort:** Medium

Add proper validators to all form fields.

**Devin Prompt:**

```
1. In src/app/features/article/pages/editor/editor.component.ts (lines 26-29):
   Add Validators.required to title, description, and body FormControls.
   Add Validators.minLength(1) to title.
   Add Validators.maxLength(255) to title and description.
   Import Validators from '@angular/forms'.

2. In src/app/features/article/pages/editor/editor.component.html:
   Add validation error messages below each form field.
   Disable the "Publish Article" button when the form is invalid: [disabled]="!articleForm.valid || isSubmitting()"

3. In src/app/features/settings/settings.component.ts (lines 26-35):
   Add Validators.required to username and email.
   Add Validators.email to the email field.
   Remove Validators.required from password (it should be optional for updates).
   Add Validators.minLength(8) to password.

4. In src/app/features/settings/settings.component.html:
   Add validation error messages below each field.
   Disable submit when form is invalid.

Add comments explaining the validation rules for each form field.
```

### 2.6 Add Request/Response DTOs (GAP-API-01)

**Severity:** Medium | **Effort:** Medium

Create separate interfaces for API request and response objects.

**Devin Prompt:**

```
Create src/app/features/article/models/article-request.model.ts with:
- CreateArticleRequest: { title: string; description: string; body: string; tagList: string[] }
- UpdateArticleRequest: { title?: string; description?: string; body?: string; tagList?: string[] }

Update src/app/features/article/services/articles.service.ts:
- Change create() parameter from Partial<Article> to CreateArticleRequest (line 35)
- Change update() parameter from Partial<Article> to UpdateArticleRequest & { slug: string } (line 39)

Update src/app/features/article/pages/editor/editor.component.ts:
- Use CreateArticleRequest/UpdateArticleRequest when calling the service (lines 84-86)

Add comments explaining the separation of request DTOs from response models
and why this improves type safety at the API boundary.
```

### 2.7 Add Retry Logic to Data-Fetching Services (GAP-RES-02)

**Severity:** Medium | **Effort:** Medium

Add RxJS retry operators for transient failures.

**Devin Prompt:**

```
Create a shared retry utility in src/app/core/utils/retry.operator.ts:
- Export a function retryWithBackoff(maxRetries = 2, initialDelay = 1000) that returns
  an RxJS operator using retry({ count: maxRetries, delay: (error, retryCount) => timer(initialDelay * retryCount) })
- Only retry on 5XX errors and status 0 (network errors), not on 4XX errors
- Import from 'rxjs' and 'rxjs/operators'

Apply the retry operator to read-only endpoints in:
- src/app/features/article/services/articles.service.ts: query() and get() methods
- src/app/features/article/services/tags.service.ts: getAll() method
- src/app/features/profile/services/profile.service.ts: get() method

Do NOT add retries to mutating operations (create, update, delete, follow, favorite).
Add comments explaining the retry strategy, which errors trigger retries,
and why mutations are excluded to prevent duplicate side effects.
```

### 2.8 Add Performance Monitoring (GAP-OBS-02)

**Severity:** Medium | **Effort:** Medium

Implement basic Web Vitals and navigation timing.

**Devin Prompt:**

```
Create src/app/core/services/performance.service.ts:
- Injectable service that captures Core Web Vitals (LCP, FID, CLS) using the web-vitals library
- Track route navigation duration using Angular Router events (NavigationStart -> NavigationEnd)
- Log metrics via the LoggerService from GAP-OBS-01

Install the web-vitals package: bun add web-vitals

Initialize the service in src/app/app.config.ts as part of APP_INITIALIZER.
Add comments explaining each Web Vital metric and the navigation timing approach.
```

### 2.9 Centralize Test Setup Boilerplate (GAP-TST-05)

**Severity:** Low | **Effort:** Small

Move Zone.js imports and TestBed initialization to the setup file.

**Devin Prompt:**

```
In src/test-setup.ts, add:
  import 'zone.js';
  import 'zone.js/testing';
  import { getTestBed } from '@angular/core/testing';
  import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
  getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

Then remove these lines from every *.spec.ts file:
  - import 'zone.js';
  - import 'zone.js/testing';
  - The beforeAll(() => { getTestBed().initTestEnvironment(...) }) block

Files to update:
  - src/app/core/auth/services/jwt.service.spec.ts (lines 1-2, 12-14)
  - src/app/core/auth/services/user.service.spec.ts (lines 1-2, 14-16)
  - src/app/features/article/services/articles.service.spec.ts (lines 1-2, 13-15)
  - src/app/features/article/services/comments.service.spec.ts (lines 1-2, 12-14)
  - src/app/features/article/services/tags.service.spec.ts (lines 1-2, 11-13)
  - src/app/features/profile/services/profile.service.spec.ts (lines 1-2, 12-14)

Add a comment in test-setup.ts explaining the centralized test environment initialization.
```

### 2.10 Add Tests for Pipes and Directives (GAP-TST-03)

**Severity:** Medium | **Effort:** Small

Create unit tests for shared pipes and the auth directive.

**Devin Prompt:**

```
Create three test files:

1. src/app/shared/pipes/default-image.pipe.spec.ts:
   - Test that null/undefined returns the default avatar path '/assets/images/default-avatar.svg'
   - Test that a valid URL is returned as-is
   - Test that empty string returns the default avatar

2. src/app/shared/pipes/markdown.pipe.spec.ts:
   - Test that markdown is converted to HTML (e.g., '**bold**' -> '<strong>bold</strong>')
   - Test that XSS content is sanitized (e.g., '<script>' tags are removed)
   - Test that the pipe returns a Promise (async pipe)

3. src/app/core/auth/if-authenticated.directive.spec.ts:
   - Test that content is shown when condition=true and user is authenticated
   - Test that content is hidden when condition=true and user is not authenticated
   - Test that content is shown when condition=false and user is not authenticated

Add comments explaining what each test validates and the expected behavior.
```

### 2.11 Add Tests for Auth Guard (GAP-TST-04)

**Severity:** Medium | **Effort:** Small

Create unit tests for the `requireAuth` guard function.

**Devin Prompt:**

```
Create src/app/core/auth/require-auth.guard.spec.ts:
- Extract the requireAuth function from src/app/app.routes.ts (lines 7-14) into its own file
  src/app/core/auth/guards/require-auth.guard.ts for better testability
- Test that authenticated users are allowed to proceed (returns true)
- Test that unauthenticated users are redirected to /login
- Test the redirect URL matches '/login'
- Mock UserService.isAuthenticated and Router.navigate

Update src/app/app.routes.ts to import requireAuth from the new file location.
Add comments explaining the guard's authentication check and redirect behavior.
```

---

## Phase 3: Polish (6-12 Weeks)

> Lower severity items, large-effort improvements, and nice-to-have enhancements.

### 3.1 Add Component Unit Tests (GAP-TST-01)

**Severity:** High | **Effort:** Large

Create unit tests for all 16 untested components. Prioritize by complexity and user impact.

**Devin Prompt:**

```
Create component unit tests in priority order. For each component, test:
- Component creation
- Input/output bindings
- Template rendering with mock data
- User interaction handlers
- Observable subscription behavior

Priority 1 (core UI):
- src/app/core/layout/header.component.spec.ts: Test auth state rendering (4 states: loading, authenticated, unauthenticated, unavailable)
- src/app/core/auth/auth.component.spec.ts: Test login vs register form rendering, form submission, error display

Priority 2 (article features):
- src/app/features/article/components/article-list.component.spec.ts: Test loading states, pagination, empty results
- src/app/features/article/pages/home/home.component.spec.ts: Test feed toggle, tag selection, auth-aware feed
- src/app/features/article/pages/editor/editor.component.spec.ts: Test create vs edit modes, tag management, form submission

Priority 3 (remaining):
- src/app/features/article/pages/article/article.component.spec.ts
- src/app/features/article/components/article-preview.component.spec.ts
- src/app/features/article/components/article-meta.component.spec.ts
- src/app/features/article/components/article-comment.component.spec.ts
- src/app/features/article/components/favorite-button.component.spec.ts
- src/app/features/profile/components/follow-button.component.spec.ts
- src/app/features/profile/pages/profile/profile.component.spec.ts
- src/app/features/profile/components/profile-articles.component.spec.ts
- src/app/features/profile/components/profile-favorites.component.spec.ts
- src/app/features/settings/settings.component.spec.ts
- src/app/core/layout/footer.component.spec.ts

Use Angular TestBed with component fixture, mock services via useValue/useClass,
and follow existing Vitest + Angular testing patterns. Add comments explaining
the test scenarios and mock data setup for each component.
```

### 3.2 Migrate JWT Storage to HttpOnly Cookies (GAP-SEC-02)

**Severity:** Medium | **Effort:** Large

Requires backend changes. Document the migration path if the backend supports cookie-based auth.

**Devin Prompt:**

```
This requires coordination with the backend API. Create a migration plan document:

1. Create docs/JWT_MIGRATION_PLAN.md outlining:
   - Current state: JWT in localStorage via JwtService
   - Target state: JWT in HttpOnly, Secure, SameSite cookie set by backend
   - Frontend changes needed:
     a. Modify src/app/core/auth/services/jwt.service.ts to remove localStorage usage
     b. Modify src/app/core/interceptors/token.interceptor.ts to stop adding Authorization header
        (cookies are sent automatically)
     c. Add withCredentials: true to HttpClient configuration in src/app/app.config.ts
     d. Update src/app/core/interceptors/api.interceptor.ts to handle CSRF tokens if needed
   - Backend changes needed:
     a. Set-Cookie response header on login/register endpoints
     b. Cookie attributes: HttpOnly, Secure, SameSite=Strict, Path=/api
     c. CSRF protection endpoint
   - Rollback plan

Add comments explaining why HttpOnly cookies are more secure than localStorage
and the CSRF considerations for cookie-based auth.
```

### 3.3 Add Barrel Exports (GAP-ORG-04)

**Severity:** Low | **Effort:** Medium

Create index.ts files for cleaner imports.

**Devin Prompt:**

```
Create barrel export files:

1. src/app/core/index.ts:
   export { UserService } from './auth/services/user.service';
   export { JwtService } from './auth/services/jwt.service';
   export { IfAuthenticatedDirective } from './auth/if-authenticated.directive';
   export { Errors } from './models/errors.model';
   export { LoadingState } from './models/loading-state.model';

2. src/app/shared/index.ts:
   export { ListErrorsComponent } from './components/list-errors.component';
   export { DefaultImagePipe } from './pipes/default-image.pipe';
   export { MarkdownPipe } from './pipes/markdown.pipe';

3. src/app/features/article/index.ts:
   export { ArticlesService } from './services/articles.service';
   export { CommentsService } from './services/comments.service';
   export { TagsService } from './services/tags.service';
   export { Article } from './models/article.model';
   export { Comment } from './models/comment.model';

4. src/app/features/profile/index.ts:
   export { ProfileService } from './services/profile.service';
   export { Profile } from './models/profile.model';

Update tsconfig.json paths to add aliases:
  "@core/*": ["src/app/core/*"], "@shared/*": ["src/app/shared/*"],
  "@features/*": ["src/app/features/*"]

Add comments in each barrel file listing what is exported and why.
```

### 3.4 Add OpenAPI Type Generation (GAP-API-02)

**Severity:** Low | **Effort:** Medium

Generate TypeScript types from the RealWorld API specification.

**Devin Prompt:**

```
Install openapi-typescript: bun add -D openapi-typescript

Create scripts/generate-api-types.ts that:
1. Downloads the RealWorld OpenAPI spec from https://github.com/gothinkster/realworld/blob/main/api/openapi.yml
2. Generates TypeScript types to src/app/core/api/generated-types.ts

Add a script to package.json: "generate:api-types": "openapi-typescript <spec-url> -o src/app/core/api/generated-types.ts"

Compare generated types against existing interfaces in:
- src/app/core/auth/user.model.ts
- src/app/features/article/models/article.model.ts
- src/app/features/article/models/comment.model.ts
- src/app/features/profile/models/profile.model.ts

Add comments explaining the type generation process and how to keep types in sync.
```

### 3.5 Add Client-Side Health Monitoring (GAP-OBS-03)

**Severity:** Low | **Effort:** Small

Implement periodic backend health checks.

**Devin Prompt:**

```
Create src/app/core/services/health-check.service.ts:
- Injectable service that periodically pings GET /tags (lightweight endpoint)
- Use interval(30000) from RxJS (every 30 seconds)
- Track consecutive failures and emit a health status observable
- Integrate with the header component to show a banner when the API is unreachable
- Only run health checks when the document is visible (use document.visibilityState)

Register in src/app/app.config.ts as an APP_INITIALIZER.
Add comments explaining the health check strategy, polling interval, and visibility optimization.
```

### 3.6 Add Offline Support with Service Worker (GAP-RES-04)

**Severity:** Low | **Effort:** Large

Enable PWA features with Angular's service worker.

**Devin Prompt:**

```
Add Angular PWA support:
1. Run: ng add @angular/pwa
2. Configure ngsw-config.json with:
   - App shell caching (index.html, main bundle, styles)
   - Asset caching (images, fonts) with cache-first strategy
   - API caching for GET /tags and GET /articles with network-first strategy
   - Offline fallback page

3. Update src/app/app.config.ts to register the service worker:
   import { provideServiceWorker } from '@angular/service-worker';
   Add provideServiceWorker('ngsw-worker.js', { enabled: !isDevMode() }) to providers.

4. Add an offline indicator component that shows when navigator.onLine is false.

Add comments explaining the caching strategies chosen for each resource type
and the offline user experience.
```

---

## Summary Timeline

| Phase               | Duration   | Items    | Gaps Addressed                                                                                                                                 |
| ------------------- | ---------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 1: Quick Wins | Weeks 1-2  | 12 items | GAP-RES-01, GAP-SEC-01, GAP-ORG-01, GAP-RES-05, GAP-ERR-02, GAP-RES-03, GAP-ORG-03, GAP-ORG-02, GAP-SEC-05, GAP-API-03, GAP-ERR-04, GAP-SEC-03 |
| Phase 2: Important  | Weeks 3-6  | 11 items | GAP-ERR-01, GAP-TST-02, GAP-ERR-03, GAP-OBS-01, GAP-SEC-04, GAP-API-01, GAP-RES-02, GAP-OBS-02, GAP-TST-05, GAP-TST-03, GAP-TST-04             |
| Phase 3: Polish     | Weeks 6-12 | 6 items  | GAP-TST-01, GAP-SEC-02, GAP-ORG-04, GAP-API-02, GAP-OBS-03, GAP-RES-04                                                                         |

## Key Metrics

| Metric                    | Current | After Phase 1 | After Phase 2 | After Phase 3 |
| ------------------------- | ------- | ------------- | ------------- | ------------- |
| Total Gaps                | 29      | 17            | 6             | 0             |
| High Severity Open        | 7       | 4             | 0             | 0             |
| Medium Severity Open      | 14      | 8             | 0             | 0             |
| Low Severity Open         | 8       | 5             | 6             | 0             |
| Service Unit Test Files   | 6       | 6             | 9             | 9             |
| Component Unit Test Files | 0       | 0             | 0             | 16            |
| Interceptor Test Files    | 0       | 0             | 3             | 3             |
| Pipe/Directive Test Files | 0       | 0             | 3             | 3             |
