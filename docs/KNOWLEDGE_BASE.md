# Application Knowledge Base

## ts-angular-realworld-example-app

> A reference implementation of the RealWorld "Conduit" social blogging platform built with Angular 21, TypeScript 5.9, and Vite.

---

## 1. Architecture Overview

### 1.1 Technology Stack

| Layer             | Technology                               | Version  |
| ----------------- | ---------------------------------------- | -------- |
| Framework         | Angular                                  | 21.1.1   |
| Language          | TypeScript                               | 5.9.3    |
| Reactive Library  | RxJS                                     | 7.8.2    |
| Build System      | Vite (via @analogjs/vite-plugin-angular) | 2.2.2    |
| Unit Testing      | Vitest                                   | 4.0.18   |
| E2E Testing       | Playwright                               | 1.58.0   |
| Code Formatting   | Prettier                                 | 3.8.1    |
| Git Hooks         | Husky                                    | 9.1.7    |
| Package Manager   | Bun                                      | (system) |
| Rendering Library | @rx-angular/template                     | 19.0.1   |
| Markdown Parsing  | marked                                   | 15.0.8   |

### 1.2 Module Inventory

| Module              | Path                         | Responsibility                                                                                     |
| ------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------- |
| Core / Auth         | `src/app/core/auth/`         | Authentication state, login/register, JWT management, auth guards, conditional rendering directive |
| Core / Interceptors | `src/app/core/interceptors/` | API base URL injection, token attachment, global error normalization                               |
| Core / Layout       | `src/app/core/layout/`       | Header navigation (auth-aware), footer                                                             |
| Core / Models       | `src/app/core/models/`       | Shared interfaces: `Errors`, `LoadingState` enum                                                   |
| Feature / Article   | `src/app/features/article/`  | Articles CRUD, comments, tags, home page feed, editor, article detail                              |
| Feature / Profile   | `src/app/features/profile/`  | User profiles, follow/unfollow, profile articles & favorites                                       |
| Feature / Settings  | `src/app/features/settings/` | User settings page (update profile, change password, logout)                                       |
| Shared / Components | `src/app/shared/components/` | `ListErrorsComponent` for rendering API validation errors                                          |
| Shared / Pipes      | `src/app/shared/pipes/`      | `DefaultImagePipe` (fallback avatar), `MarkdownPipe` (sanitized markdown-to-HTML)                  |
| E2E Tests           | `e2e/`                       | Playwright test suites: auth, articles, comments, navigation, security, error handling             |

### 1.3 Communication Pattern

```
┌──────────────────────────────────────────────────────────────┐
│                        Browser (SPA)                         │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │  Components  │──│   Services   │──│  HTTP Interceptors │  │
│  │  (Signals +  │  │  (RxJS +     │  │  1. apiInterceptor │  │
│  │   OnPush)    │  │   HttpClient)│  │  2. tokenInterceptor│ │
│  └─────────────┘  └──────────────┘  │  3. errorInterceptor│  │
│                                      └─────────┬──────────┘  │
│                                                │              │
└────────────────────────────────────────────────┼──────────────┘
                                                 │ HTTPS
                                                 ▼
                                   ┌─────────────────────────┐
                                   │  https://api.realworld   │
                                   │       .show/api          │
                                   │                          │
                                   │  RealWorld Backend API   │
                                   │  (External, shared)      │
                                   └─────────────────────────┘
```

- **Single-Page Application (SPA):** The client is a standalone Angular 21 application.
- **External API:** All data is served by the shared RealWorld API at `https://api.realworld.show/api`.
- **HTTP Interceptor Chain:** Three functional interceptors are applied in order:
  1. `apiInterceptor` — Prepends the base URL to all requests.
  2. `tokenInterceptor` — Attaches `Authorization: Token <jwt>` header if a token exists.
  3. `errorInterceptor` — Normalizes error responses and handles 401 logout for non-`/user` endpoints.
- **State Management:** No NgRx or dedicated store. State is managed via:
  - `BehaviorSubject` in `UserService` for auth state and current user.
  - Angular Signals (`signal()`, `computed()`) in components for local UI state.
  - RxJS observables for async data flows.

### 1.4 Routing Architecture

Routes are defined in `src/app/app.routes.ts` using standalone lazy-loaded components:

| Route                          | Component                   | Guard         | Description                            |
| ------------------------------ | --------------------------- | ------------- | -------------------------------------- |
| `/`                            | `HomeComponent`             | None          | Global/following feed with tag sidebar |
| `/tag/:tag`                    | `HomeComponent`             | None          | Filtered feed by tag                   |
| `/login`                       | `AuthComponent`             | None          | Login form                             |
| `/register`                    | `AuthComponent`             | None          | Registration form                      |
| `/settings`                    | `SettingsComponent`         | `requireAuth` | User settings (auth required)          |
| `/profile/:username`           | `ProfileComponent`          | None          | User profile with child routes         |
| `/profile/:username/favorites` | `ProfileFavoritesComponent` | None          | User's favorited articles              |
| `/editor`                      | `EditorComponent`           | `requireAuth` | New article editor (auth required)     |
| `/editor/:slug`                | `EditorComponent`           | `requireAuth` | Edit existing article (auth required)  |
| `/article/:slug`               | `ArticleComponent`          | None          | Article detail with comments           |

The `requireAuth` guard checks `UserService.isAuthenticated` and redirects unauthenticated users to `/login`.

---

## 2. Data Model Documentation

### 2.1 User

**Interface:** `src/app/core/auth/user.model.ts`

| Field      | Type             | Description              |
| ---------- | ---------------- | ------------------------ |
| `email`    | `string`         | User's email address     |
| `token`    | `string`         | JWT authentication token |
| `username` | `string`         | Unique username          |
| `bio`      | `string \| null` | User biography           |
| `image`    | `string \| null` | Avatar image URL         |

### 2.2 Profile

**Interface:** `src/app/features/profile/models/profile.model.ts`

| Field       | Type             | Description                                   |
| ----------- | ---------------- | --------------------------------------------- |
| `username`  | `string`         | Profile owner's username                      |
| `bio`       | `string \| null` | Biography text                                |
| `image`     | `string \| null` | Avatar image URL                              |
| `following` | `boolean`        | Whether the current user follows this profile |

### 2.3 Article

**Interface:** `src/app/features/article/models/article.model.ts`

| Field            | Type       | Description                            |
| ---------------- | ---------- | -------------------------------------- |
| `slug`           | `string`   | URL-friendly unique identifier         |
| `title`          | `string`   | Article title                          |
| `description`    | `string`   | Short description / subtitle           |
| `body`           | `string`   | Full article body (markdown)           |
| `tagList`        | `string[]` | Associated tags                        |
| `createdAt`      | `string`   | ISO 8601 creation timestamp            |
| `updatedAt`      | `string`   | ISO 8601 update timestamp              |
| `favorited`      | `boolean`  | Whether the current user has favorited |
| `favoritesCount` | `number`   | Total favorites count                  |
| `author`         | `Profile`  | Author's profile data                  |

### 2.4 Comment

**Interface:** `src/app/features/article/models/comment.model.ts`

| Field       | Type      | Description                   |
| ----------- | --------- | ----------------------------- |
| `id`        | `string`  | Comment identifier            |
| `body`      | `string`  | Comment text                  |
| `createdAt` | `string`  | ISO 8601 creation timestamp   |
| `author`    | `Profile` | Comment author's profile data |

### 2.5 ArticleListConfig

**Interface:** `src/app/features/article/models/article-list-config.model.ts`

| Field               | Type      | Description                    |
| ------------------- | --------- | ------------------------------ |
| `type`              | `string`  | Feed type: `'all'` or `'feed'` |
| `filters.tag`       | `string?` | Filter by tag                  |
| `filters.author`    | `string?` | Filter by author username      |
| `filters.favorited` | `string?` | Filter by user who favorited   |
| `filters.limit`     | `number?` | Page size                      |
| `filters.offset`    | `number?` | Pagination offset              |

### 2.6 Supporting Models

| Model          | Path                                         | Fields                                  |
| -------------- | -------------------------------------------- | --------------------------------------- |
| `Errors`       | `src/app/core/models/errors.model.ts`        | `errors: { [key: string]: string }`     |
| `LoadingState` | `src/app/core/models/loading-state.model.ts` | Enum: `NOT_LOADED`, `LOADING`, `LOADED` |

### 2.7 Entity Relationships

```
User ──────── 1:1 ──────── Profile
  │                           │
  │ (authenticated user)      │ (public view of any user)
  │                           │
  ├── writes ──── 1:N ────── Article
  │                           │
  │                           ├── has ──── 1:N ──── Comment
  │                           │                       │
  │                           │                       └── author ── Profile
  │                           │
  │                           └── tagged ── N:M ──── Tag (string)
  │
  ├── favorites ── N:M ────── Article
  │
  └── follows ──── N:M ────── Profile
```

---

## 3. API Surface Map

All HTTP requests are routed through `apiInterceptor` which prepends `https://api.realworld.show/api`.

### 3.1 Authentication Endpoints

**Service:** `UserService` (`src/app/core/auth/services/user.service.ts`)

| Method | Endpoint       | Request Body                              | Response         | Description         |
| ------ | -------------- | ----------------------------------------- | ---------------- | ------------------- |
| `POST` | `/users/login` | `{ user: { email, password } }`           | `{ user: User }` | Login               |
| `POST` | `/users`       | `{ user: { username, email, password } }` | `{ user: User }` | Register            |
| `GET`  | `/user`        | —                                         | `{ user: User }` | Get current user    |
| `PUT`  | `/user`        | `{ user: Partial<User> }`                 | `{ user: User }` | Update current user |

### 3.2 Article Endpoints

**Service:** `ArticlesService` (`src/app/features/article/services/articles.service.ts`)

| Method   | Endpoint                   | Request Body                    | Response                                         | Description        |
| -------- | -------------------------- | ------------------------------- | ------------------------------------------------ | ------------------ |
| `GET`    | `/articles`                | — (query params)                | `{ articles: Article[], articlesCount: number }` | List articles      |
| `GET`    | `/articles/feed`           | — (query params)                | `{ articles: Article[], articlesCount: number }` | User's feed        |
| `GET`    | `/articles/:slug`          | —                               | `{ article: Article }`                           | Get single article |
| `POST`   | `/articles/`               | `{ article: Partial<Article> }` | `{ article: Article }`                           | Create article     |
| `PUT`    | `/articles/:slug`          | `{ article: Partial<Article> }` | `{ article: Article }`                           | Update article     |
| `DELETE` | `/articles/:slug`          | —                               | `void`                                           | Delete article     |
| `POST`   | `/articles/:slug/favorite` | `{}`                            | `{ article: Article }`                           | Favorite article   |
| `DELETE` | `/articles/:slug/favorite` | —                               | `void`                                           | Unfavorite article |

**Query Parameters (for list endpoints):** `tag`, `author`, `favorited`, `limit`, `offset`

### 3.3 Comment Endpoints

**Service:** `CommentsService` (`src/app/features/article/services/comments.service.ts`)

| Method   | Endpoint                       | Request Body                    | Response                  | Description    |
| -------- | ------------------------------ | ------------------------------- | ------------------------- | -------------- |
| `GET`    | `/articles/:slug/comments`     | —                               | `{ comments: Comment[] }` | List comments  |
| `POST`   | `/articles/:slug/comments`     | `{ comment: { body: string } }` | `{ comment: Comment }`    | Add comment    |
| `DELETE` | `/articles/:slug/comments/:id` | —                               | `void`                    | Delete comment |

### 3.4 Tag Endpoints

**Service:** `TagsService` (`src/app/features/article/services/tags.service.ts`)

| Method | Endpoint | Response             | Description   |
| ------ | -------- | -------------------- | ------------- |
| `GET`  | `/tags`  | `{ tags: string[] }` | List all tags |

### 3.5 Profile Endpoints

**Service:** `ProfileService` (`src/app/features/profile/services/profile.service.ts`)

| Method   | Endpoint                     | Request Body | Response               | Description      |
| -------- | ---------------------------- | ------------ | ---------------------- | ---------------- |
| `GET`    | `/profiles/:username`        | —            | `{ profile: Profile }` | Get user profile |
| `POST`   | `/profiles/:username/follow` | `{}`         | `{ profile: Profile }` | Follow user      |
| `DELETE` | `/profiles/:username/follow` | —            | `{ profile: Profile }` | Unfollow user    |

---

## 4. Key Business Logic Inventory

### 4.1 Authentication Flow

**Location:** `src/app/app.config.ts` (lines 23-52), `src/app/core/auth/services/user.service.ts`

1. Application bootstraps and runs `initAuth()` via `APP_INITIALIZER`.
2. `JwtService.getToken()` checks `localStorage` for a stored JWT.
3. If a token exists, `UserService.getCurrentUser()` calls `GET /user` to validate it.
4. On success: `setAuth(user)` saves the token and sets `authState` to `'authenticated'`.
5. On 4XX error (invalid token): `purgeAuth()` clears the token, sets `authState` to `'unauthenticated'`.
6. On 5XX error (server down): `setAuthUnavailable()` sets `authState` to `'unavailable'`, preserves the token, and schedules auto-retry with exponential backoff (2s -> 4s -> 8s -> 16s -> 16s cap).
7. If no token exists: `purgeAuth()` immediately sets `authState` to `'unauthenticated'`.

### 4.2 Auto-Retry with Exponential Backoff

**Location:** `src/app/core/auth/services/user.service.ts`

- Triggered when `GET /user` returns a 5XX error during auth validation.
- Backoff schedule: 2000ms, 4000ms, 8000ms, 16000ms, then capped at 16000ms.
- Uses `setTimeout` to schedule retries. Each retry calls `getCurrentUser()` again.
- Successful retry transitions state from `'unavailable'` to `'authenticated'`.
- A 4XX error during retry triggers `purgeAuth()` (token became invalid).

### 4.3 Article CRUD Flow

**Location:** `src/app/features/article/pages/editor/editor.component.ts`

1. **Create:** User fills form fields (title, description, body) and adds tags. `submitForm()` calls `ArticlesService.create()` which POSTs to `/articles/`.
2. **Edit:** If route has `:slug` param, `ngOnInit()` loads the article, verifies the current user is the author, and pre-fills the form. `submitForm()` calls `ArticlesService.update()`.
3. **Delete:** Article page shows delete button if `canModify` (current user is author). Calls `ArticlesService.delete()` and navigates to home.

### 4.4 Feed & Pagination Flow

**Location:** `src/app/features/article/pages/home/home.component.ts`, `src/app/features/article/components/article-list.component.ts`

1. `HomeComponent.ngOnInit()` combines auth state, route params, and query params.
2. Determines feed type: `'all'` (global), `'feed'` (following), or tag-filtered.
3. Sets `listConfig` signal which triggers `ArticleListComponent.ngOnChanges()`.
4. `ArticleListComponent.runQuery()` calls `ArticlesService.query()` with pagination (limit=10, offset calculated from page number).
5. Pagination is URL-driven: page changes update query params via `router.navigate()`.

### 4.5 Favorite / Follow Flow

**Location:** `src/app/features/article/components/favorite-button.component.ts`, `src/app/features/profile/components/follow-button.component.ts`

1. Both check `UserService.isAuthenticated` before making the API call.
2. Unauthenticated users are redirected to `/register` (favorite) or `/login` (follow).
3. Optimistic UI update: the component signal is updated locally before the HTTP response returns via event emission to parent.

### 4.6 Comment Management

**Location:** `src/app/features/article/pages/article/article.component.ts`

1. Comments are loaded alongside the article via `combineLatest([articleService.get(), commentsService.getAll(), userService.currentUser])`.
2. Adding a comment calls `CommentsService.add()`, prepends the new comment to the list signal on success.
3. Deleting a comment calls `CommentsService.delete()`, filters the comment from the list signal on success.
4. Delete button visibility is controlled by comparing `currentUser.username` to `comment.author.username`.

### 4.7 Markdown Rendering

**Location:** `src/app/shared/pipes/markdown.pipe.ts`

1. The `MarkdownPipe` is an async pipe that dynamically imports the `marked` library.
2. Parses markdown to HTML via `marked.parse()`.
3. Sanitizes the output using Angular's `DomSanitizer.sanitize(SecurityContext.HTML, ...)` to prevent XSS.
4. Used in article detail view to render article body.

---

## 5. Integration Points

### 5.1 RealWorld Backend API

| Property          | Value                                                                         |
| ----------------- | ----------------------------------------------------------------------------- |
| **Purpose**       | Provides all backend functionality (auth, articles, comments, tags, profiles) |
| **Base URL**      | `https://api.realworld.show/api`                                              |
| **Configuration** | Hardcoded in `src/app/core/interceptors/api.interceptor.ts` (line 2)          |
| **Protocol**      | REST over HTTPS                                                               |
| **Auth**          | JWT token in `Authorization: Token <jwt>` header                              |
| **Specification** | [RealWorld API Spec](https://github.com/gothinkster/realworld/tree/main/api)  |

### 5.2 Browser localStorage

| Property       | Value                                                      |
| -------------- | ---------------------------------------------------------- |
| **Purpose**    | Persists JWT token across browser sessions                 |
| **Key**        | `jwtToken`                                                 |
| **Service**    | `JwtService` (`src/app/core/auth/services/jwt.service.ts`) |
| **Operations** | `getToken()`, `saveToken(token)`, `destroyToken()`         |

### 5.3 Debug Interface (E2E Testing)

| Property          | Value                                                             |
| ----------------- | ----------------------------------------------------------------- |
| **Purpose**       | Exposes application state for Playwright E2E tests                |
| **Global**        | `window.__conduit_debug__`                                        |
| **Configuration** | `src/app/app.config.ts` (lines 8-15)                              |
| **Methods**       | `getToken()`, `getAuthState()`, `getCurrentUser()`, `getRouter()` |

---

## 6. Build and Deployment Pipeline Summary

### 6.1 Build Commands

| Command                | Description                                             |
| ---------------------- | ------------------------------------------------------- |
| `bun run start`        | Development server at `localhost:4200` (via `ng serve`) |
| `bun run build`        | Production build (via `ng build`)                       |
| `bun run test`         | Unit tests via Vitest                                   |
| `bun run test:e2e`     | E2E tests via Playwright                                |
| `bun run format`       | Format code with Prettier                               |
| `bun run format:check` | Check formatting without writing changes                |

### 6.2 Build Configuration

- **Builder:** `@angular-devkit/build-angular:application` with `@analogjs/vite-plugin-angular`.
- **Output:** `dist/angular-conduit/browser` directory.
- **Bundle Budgets:** Initial bundle warning at 500KB, error at 1MB; component styles warning at 2KB, error at 4KB.
- **Source Maps:** Disabled in production builds.
- **SPA Routing:** `src/_redirects` file for deployment platforms (e.g., Netlify/Cloudflare).

### 6.3 TypeScript Configuration

- **Strict mode:** Enabled (`strict: true` in `tsconfig.json`).
- **Additional checks:** `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`, `noFallthroughCasesInSwitch`.
- **Angular strictness:** `strictInjectionParameters`, `strictInputAccessModifiers`, `strictTemplates`.
- **Target:** ES2022, module ES2022.

### 6.4 Testing Configuration

**Unit Tests (Vitest):**

- Environment: `jsdom`.
- Setup file: `src/test-setup.ts`.
- Coverage provider: `v8`.
- Path alias: `@` maps to `src/`.

**E2E Tests (Playwright):**

- Browser: Chromium only (Firefox/WebKit disabled for speed).
- Base URL: `http://localhost:4200`.
- Timeouts: 15s per test, 5s action, 10s navigation.
- Workers: 1 (serial execution to avoid race conditions).
- Web server: `npm run start` with 120s startup timeout.

### 6.5 Code Quality Tools

- **Prettier:** Single quotes, 120 char width, tab width 2, trailing commas, avoid arrow parens.
- **Husky:** Git hooks for pre-commit formatting.
- **EditorConfig:** UTF-8 charset, 2-space indentation, final newline, trim trailing whitespace.
- **Browser Support:** Last 2 versions of Chrome, Firefox, Safari, Edge, plus Firefox ESR.

### 6.6 CI/CD

No CI/CD pipeline is configured in the repository. The CI workflows have been explicitly removed (commit message: "Remove CI workflows for workshop mirror").

---

## 7. Test Coverage Summary

### 7.1 Unit Tests (6 spec files)

| Service           | File                       | Test Count | Coverage                                                |
| ----------------- | -------------------------- | ---------- | ------------------------------------------------------- |
| `JwtService`      | `jwt.service.spec.ts`      | ~35 tests  | Token CRUD lifecycle, edge cases, security              |
| `UserService`     | `user.service.spec.ts`     | ~20 tests  | Auth flow, login, register, logout, update, observables |
| `ArticlesService` | `articles.service.spec.ts` | ~15 tests  | Query, get, create, update, delete, favorite            |
| `CommentsService` | `comments.service.spec.ts` | ~25 tests  | GetAll, add, delete, integration scenarios, edge cases  |
| `TagsService`     | `tags.service.spec.ts`     | ~40 tests  | GetAll with various data types, errors, performance     |
| `ProfileService`  | `profile.service.spec.ts`  | ~25 tests  | Get, follow, unfollow, integration, edge cases          |

### 7.2 E2E Tests (12 spec files)

| File                        | Coverage Area                                                            |
| --------------------------- | ------------------------------------------------------------------------ |
| `auth.spec.ts`              | Registration, login, logout, session persistence, invalid token handling |
| `articles.spec.ts`          | Article CRUD operations                                                  |
| `comments.spec.ts`          | Comment add/delete flows                                                 |
| `settings.spec.ts`          | User settings update                                                     |
| `social.spec.ts`            | Follow/unfollow, favorite/unfavorite                                     |
| `navigation.spec.ts`        | Route navigation and redirects                                           |
| `url-navigation.spec.ts`    | Direct URL access patterns                                               |
| `health.spec.ts`            | App load, API accessibility, page navigation                             |
| `error-handling.spec.ts`    | Error display and recovery                                               |
| `null-fields.spec.ts`       | Handling of null/missing data fields                                     |
| `user-fetch-errors.spec.ts` | Auth error scenarios                                                     |
| `xss-security.spec.ts`      | XSS prevention testing                                                   |

### 7.3 Untested Areas

- No unit tests for any **components** (only services are tested).
- No unit tests for **interceptors** (`apiInterceptor`, `tokenInterceptor`, `errorInterceptor`).
- No unit tests for **pipes** (`MarkdownPipe`, `DefaultImagePipe`).
- No unit tests for **directives** (`IfAuthenticatedDirective`).
- No unit tests for the **auth guard** (`requireAuth` in `app.routes.ts`).
