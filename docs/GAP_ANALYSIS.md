# Engineering Standards Gap Analysis

## ts-angular-realworld-example-app

> Assessment of the Angular RealWorld "Conduit" application against seven engineering best-practice categories.

---

## 1. Code Organization

### GAP-ORG-01: `@ts-ignore` Suppression in ArticlesService

- **Severity:** Medium
- **Effort:** Small
- **Location:** `src/app/features/article/services/articles.service.ts:17`

The `query()` method uses `@ts-ignore` to bypass TypeScript type checking when iterating over `config.filters`:

```typescript
Object.keys(config.filters).forEach(key => {
  // @ts-ignore
  params = params.set(key, config.filters[key]);
});
```

This defeats the purpose of the strict TypeScript configuration. The filters object has a well-defined interface (`ArticleListConfig`) and can be accessed safely with proper typing.

### GAP-ORG-02: Inconsistent Use of `UntypedFormGroup`

- **Severity:** Low
- **Effort:** Small
- **Location:** `src/app/features/article/pages/editor/editor.component.ts:25`

The `EditorComponent` declares `articleForm` as `UntypedFormGroup` while simultaneously defining a typed `ArticleForm` interface and constructing the form with `new FormGroup<ArticleForm>(...)`. The `UntypedFormGroup` type annotation on the variable loses the type safety of the generic:

```typescript
articleForm: UntypedFormGroup = new FormGroup<ArticleForm>({...});
```

Other components (`AuthComponent`, `SettingsComponent`) correctly use `FormGroup<T>` throughout.

### GAP-ORG-03: Duplicate `FollowButtonComponent` Import

- **Severity:** Low
- **Effort:** Small
- **Location:** `src/app/features/profile/pages/profile/profile.component.ts:18,22`

`FollowButtonComponent` is imported twice in the component's `imports` array:

```typescript
imports: [
  FollowButtonComponent,  // line 18
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  FollowButtonComponent,  // line 22 (duplicate)
  ListErrorsComponent,
  DefaultImagePipe,
],
```

### GAP-ORG-04: No Barrel Exports or Index Files

- **Severity:** Low
- **Effort:** Medium
- **Location:** Project-wide

Feature modules, core services, and shared components lack barrel export files (`index.ts`). Import paths are verbose and fragile:

```typescript
import { UserService } from '../../../../core/auth/services/user.service';
import { DefaultImagePipe } from '../../../../shared/pipes/default-image.pipe';
```

Deep relative imports (4+ levels) are common throughout the codebase, making refactoring difficult.

---

## 2. Error Handling

### GAP-ERR-01: Inconsistent Error Handling in Components

- **Severity:** High
- **Effort:** Medium
- **Location:** Multiple components

Error handling is inconsistent across components:

- `ArticleComponent.ngOnInit()` (line 72) uses `catchError` to capture errors and display them.
- `ArticleListComponent.runQuery()` (line 121) has **no error handling** — a failed HTTP request silently leaves the component in `LOADING` state forever.
- `ProfileArticlesComponent.ngOnInit()` (line 31) and `ProfileFavoritesComponent.ngOnInit()` (line 31) have **no error handling** at all.
- `HomeComponent.ngOnInit()` (line 42) has **no error handling** for the combined observable.

### GAP-ERR-02: Silent Error Swallowing in Favorite/Follow Buttons

- **Severity:** Medium
- **Effort:** Small
- **Location:** `src/app/features/article/components/favorite-button.component.ts:74`, `src/app/features/profile/components/follow-button.component.ts:76`

Both button components catch errors but only reset `isSubmitting` — no user feedback is provided:

```typescript
error: () => {
  this.isSubmitting.set(false);
  // No error display to user
},
```

### GAP-ERR-03: No Global Error Boundary

- **Severity:** Medium
- **Effort:** Medium
- **Location:** Project-wide

There is no Angular `ErrorHandler` override for catching unhandled exceptions. The default `console.error` in `src/main.ts` (line 5) is the only catch:

```typescript
bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
```

Unhandled promise rejections and uncaught errors in component lifecycle methods will not be reported to the user or to any monitoring service.

### GAP-ERR-04: Error Interceptor Skips `/user` Endpoint Logic

- **Severity:** Medium
- **Effort:** Small
- **Location:** `src/app/core/interceptors/error.interceptor.ts`

The error interceptor has special handling that skips 401 processing for requests to `/user`. However, it only checks if the URL ends with `/user`, which could match other endpoints in future API evolution. The check should be more specific.

---

## 3. Testing

### GAP-TST-01: No Component Unit Tests

- **Severity:** High
- **Effort:** Large
- **Location:** Project-wide

All 6 unit test files cover only **services**. Zero component unit tests exist for:

- `HeaderComponent`, `FooterComponent`
- `ArticleListComponent`, `ArticlePreviewComponent`, `ArticleMetaComponent`
- `ArticleCommentComponent`, `FavoriteButtonComponent`, `FollowButtonComponent`
- `HomeComponent`, `EditorComponent`, `ArticleComponent`
- `ProfileComponent`, `SettingsComponent`, `AuthComponent`
- `ProfileArticlesComponent`, `ProfileFavoritesComponent`

### GAP-TST-02: No Tests for Interceptors

- **Severity:** High
- **Effort:** Medium
- **Location:** `src/app/core/interceptors/`

The three HTTP interceptors (`apiInterceptor`, `tokenInterceptor`, `errorInterceptor`) are critical middleware with no unit test coverage. These interceptors handle:

- Base URL injection
- Token attachment
- Error normalization and 401 logout
- Special `/user` endpoint handling

### GAP-TST-03: No Tests for Pipes and Directives

- **Severity:** Medium
- **Effort:** Small
- **Location:** `src/app/shared/pipes/`, `src/app/core/auth/if-authenticated.directive.ts`

`MarkdownPipe`, `DefaultImagePipe`, and `IfAuthenticatedDirective` have no unit tests. The `MarkdownPipe` is particularly important as it handles async dynamic import of `marked` and sanitization.

### GAP-TST-04: No Tests for Auth Guard

- **Severity:** Medium
- **Effort:** Small
- **Location:** `src/app/app.routes.ts` (lines 7-14)

The `requireAuth` route guard function has no direct unit tests. It is only indirectly tested by E2E tests.

### GAP-TST-05: Zone.js Import in Every Test File

- **Severity:** Low
- **Effort:** Small
- **Location:** All `*.spec.ts` files

Every test file imports `zone.js` and `zone.js/testing` at the top, and manually calls `getTestBed().initTestEnvironment()` in `beforeAll`. This boilerplate should be centralized in the Vitest setup file (`src/test-setup.ts`).

---

## 4. Security

### GAP-SEC-01: Hardcoded API Base URL

- **Severity:** High
- **Effort:** Small
- **Location:** `src/app/core/interceptors/api.interceptor.ts:2`

The API base URL is hardcoded directly in the interceptor:

```typescript
const apiReq = req.clone({ url: `https://api.realworld.show/api${req.url}` });
```

This prevents environment-specific configuration (dev, staging, production) and requires code changes to switch environments.

### GAP-SEC-02: JWT Stored in localStorage

- **Severity:** Medium
- **Effort:** Large
- **Location:** `src/app/core/auth/services/jwt.service.ts`

JWT tokens are stored in `window.localStorage` using direct property access:

```typescript
getToken(): string {
  return window.localStorage['jwtToken'];
}
```

localStorage is accessible to any JavaScript on the page, making it vulnerable to XSS attacks. While the `MarkdownPipe` does sanitize content, any XSS vulnerability elsewhere in the app or third-party scripts could steal the JWT.

### GAP-SEC-03: No Content Security Policy Headers

- **Severity:** Medium
- **Effort:** Small
- **Location:** Project-wide (no `index.html` CSP meta tag, no server config)

There is no Content Security Policy (CSP) configured. The app loads external resources (Ionicon fonts from CDN referenced in styles) and renders user-generated markdown content, making CSP particularly important.

### GAP-SEC-04: No Input Validation on Forms

- **Severity:** Medium
- **Effort:** Medium
- **Location:** `src/app/features/article/pages/editor/editor.component.ts`, `src/app/features/settings/settings.component.ts`

The editor form has **no validators** on title, description, or body fields:

```typescript
title: new FormControl('', { nonNullable: true }),       // no validators
description: new FormControl('', { nonNullable: true }), // no validators
body: new FormControl('', { nonNullable: true }),         // no validators
```

Only the auth form (`AuthComponent`) and the password field in settings have `Validators.required`. Users can submit empty articles.

### GAP-SEC-05: Email Field Uses `type="text"` Instead of `type="email"`

- **Severity:** Low
- **Effort:** Small
- **Location:** `src/app/core/auth/auth.component.html:29`

The email input in the auth form uses `type="text"` instead of `type="email"`:

```html
<input formControlName="email" placeholder="Email" class="form-control form-control-lg" type="text" />
```

This skips browser-native email validation and autocomplete hints.

---

## 5. API Design

### GAP-API-01: No Request/Response Type Safety at API Boundary

- **Severity:** Medium
- **Effort:** Medium
- **Location:** `src/app/features/article/services/articles.service.ts:35-36`

The `create()` and `update()` methods accept `Partial<Article>` which includes read-only server fields like `slug`, `createdAt`, `updatedAt`, `author`, `favorited`, `favoritesCount`. There are no separate DTO types for request vs. response:

```typescript
create(article: Partial<Article>): Observable<Article> {...}
update(article: Partial<Article>): Observable<Article> {...}
```

### GAP-API-02: No OpenAPI / API Documentation

- **Severity:** Low
- **Effort:** Medium
- **Location:** Project-wide

The frontend has no local API documentation or type generation from an OpenAPI spec. API contracts are implicitly defined by the TypeScript interfaces, but there is no validation that they match the actual backend API.

### GAP-API-03: Inconsistent Trailing Slash on Endpoints

- **Severity:** Low
- **Effort:** Small
- **Location:** `src/app/features/article/services/articles.service.ts:36`

The `create()` method uses `/articles/` (with trailing slash) while all other endpoints omit it (`/articles/:slug`, `/articles/:slug/comments`). This inconsistency could cause issues with some API servers.

---

## 6. Observability

### GAP-OBS-01: No Structured Logging

- **Severity:** High
- **Effort:** Medium
- **Location:** Project-wide

The application has no logging framework or structured logging. The only `console.error` is in `src/main.ts:5` for bootstrap failures. HTTP errors, auth state changes, retry attempts, and component lifecycle events are not logged.

### GAP-OBS-02: No Performance Monitoring

- **Severity:** Medium
- **Effort:** Medium
- **Location:** Project-wide

There is no Real User Monitoring (RUM), no performance tracking for route navigation times, no API latency measurement, and no Web Vitals reporting. Angular's built-in performance APIs are not leveraged.

### GAP-OBS-03: No Health Check Endpoint or Monitoring

- **Severity:** Low
- **Effort:** Small
- **Location:** Project-wide

While E2E tests include a `health.spec.ts` that checks API accessibility, there is no client-side health monitoring, no heartbeat to detect backend unavailability proactively, and no status page integration.

---

## 7. Resilience

### GAP-RES-01: No Error Recovery in Article List Loading

- **Severity:** High
- **Effort:** Small
- **Location:** `src/app/features/article/components/article-list.component.ts:121-132`

`ArticleListComponent.runQuery()` subscribes to the articles query but has no error handler:

```typescript
this.articlesService
  .query(this.query)
  .pipe(takeUntilDestroyed(this.destroyRef))
  .subscribe(data => {
    this.loading.set(LoadingState.LOADED);
    // ... success handling only
  });
```

If the request fails, `loading` stays as `LOADING` permanently, showing "Loading articles..." forever with no way to retry.

### GAP-RES-02: No Retry Logic for Data Fetching

- **Severity:** Medium
- **Effort:** Medium
- **Location:** All services except `UserService`

Only `UserService` implements retry logic (for auth validation). All other API calls (`ArticlesService`, `CommentsService`, `TagsService`, `ProfileService`) make single attempts with no retry on transient failures.

### GAP-RES-03: No Request Timeout Configuration

- **Severity:** Medium
- **Effort:** Small
- **Location:** Project-wide (HTTP client configuration)

The Angular `HttpClient` has no timeout configuration. Requests to the external API could hang indefinitely if the server stops responding. Only Playwright E2E tests define timeouts (5s action, 10s navigation).

### GAP-RES-04: No Offline Support or Service Worker

- **Severity:** Low
- **Effort:** Large
- **Location:** Project-wide

The application has no service worker, no offline fallback, and no caching strategy. The `ngsw-config.json` (Angular service worker config) is absent, and no PWA features are implemented.

### GAP-RES-05: `deleteArticle()` Has No Error Handling

- **Severity:** Medium
- **Effort:** Small
- **Location:** `src/app/features/article/pages/article/article.component.ts:107-119`

The article deletion operation navigates home on success but has no error handling:

```typescript
deleteArticle(): void {
  // ...
  this.articleService
    .delete(article.slug)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(() => {
      void this.router.navigate(['/']);
    });
  // No error handler — deletion failure is silent
}
```

---

## Summary Table

| ID         | Category          | Description                                         | Severity | Effort |
| ---------- | ----------------- | --------------------------------------------------- | -------- | ------ |
| GAP-ORG-01 | Code Organization | `@ts-ignore` in ArticlesService query method        | Medium   | Small  |
| GAP-ORG-02 | Code Organization | `UntypedFormGroup` used with typed form definition  | Low      | Small  |
| GAP-ORG-03 | Code Organization | Duplicate `FollowButtonComponent` import            | Low      | Small  |
| GAP-ORG-04 | Code Organization | No barrel exports, deep relative imports            | Low      | Medium |
| GAP-ERR-01 | Error Handling    | Inconsistent error handling across components       | High     | Medium |
| GAP-ERR-02 | Error Handling    | Silent error swallowing in favorite/follow buttons  | Medium   | Small  |
| GAP-ERR-03 | Error Handling    | No global `ErrorHandler` override                   | Medium   | Medium |
| GAP-ERR-04 | Error Handling    | Error interceptor URL check too broad               | Medium   | Small  |
| GAP-TST-01 | Testing           | No component unit tests (0 of 16 components tested) | High     | Large  |
| GAP-TST-02 | Testing           | No interceptor unit tests                           | High     | Medium |
| GAP-TST-03 | Testing           | No tests for pipes and directives                   | Medium   | Small  |
| GAP-TST-04 | Testing           | No tests for auth guard                             | Medium   | Small  |
| GAP-TST-05 | Testing           | Zone.js boilerplate duplicated in every test        | Low      | Small  |
| GAP-SEC-01 | Security          | Hardcoded API base URL                              | High     | Small  |
| GAP-SEC-02 | Security          | JWT stored in localStorage (XSS risk)               | Medium   | Large  |
| GAP-SEC-03 | Security          | No Content Security Policy                          | Medium   | Small  |
| GAP-SEC-04 | Security          | No form validation on editor/settings forms         | Medium   | Medium |
| GAP-SEC-05 | Security          | Email field uses `type="text"`                      | Low      | Small  |
| GAP-API-01 | API Design        | No request/response DTOs (uses `Partial<Article>`)  | Medium   | Medium |
| GAP-API-02 | API Design        | No OpenAPI documentation or type generation         | Low      | Medium |
| GAP-API-03 | API Design        | Inconsistent trailing slash on create endpoint      | Low      | Small  |
| GAP-OBS-01 | Observability     | No structured logging                               | High     | Medium |
| GAP-OBS-02 | Observability     | No performance monitoring (RUM, Web Vitals)         | Medium   | Medium |
| GAP-OBS-03 | Observability     | No client-side health monitoring                    | Low      | Small  |
| GAP-RES-01 | Resilience        | Article list stays in LOADING state on error        | High     | Small  |
| GAP-RES-02 | Resilience        | No retry logic for data-fetching services           | Medium   | Medium |
| GAP-RES-03 | Resilience        | No HTTP request timeout configuration               | Medium   | Small  |
| GAP-RES-04 | Resilience        | No offline support or service worker                | Low      | Large  |
| GAP-RES-05 | Resilience        | `deleteArticle()` has no error handling             | Medium   | Small  |

### Severity Distribution

| Severity  | Count  |
| --------- | ------ |
| Critical  | 0      |
| High      | 7      |
| Medium    | 14     |
| Low       | 8      |
| **Total** | **29** |

### Effort Distribution

| Effort    | Count  |
| --------- | ------ |
| Small     | 15     |
| Medium    | 11     |
| Large     | 3      |
| **Total** | **29** |
