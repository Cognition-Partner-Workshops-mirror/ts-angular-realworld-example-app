# Application Knowledge Base

## Angular RealWorld Example App (Conduit)

> Comprehensive technical knowledge base for the Angular implementation of the [RealWorld](https://github.com/gothinkster/realworld) spec — a Medium-clone called **Conduit**.

---

## 1. Architecture Overview

### Technology Stack

| Layer              | Technology                                             | Version        |
| ------------------ | ------------------------------------------------------ | -------------- |
| Framework          | Angular (Standalone)                                   | 21.1.1         |
| Language           | TypeScript                                             | 5.9.3          |
| Reactive Layer     | RxJS                                                   | 7.8.2          |
| Reactive Templates | @rx-angular/template, @rx-angular/cdk                  | 21.0.0         |
| Markdown Rendering | marked                                                 | 17.0.1         |
| Build Tool         | Angular CLI / Vite (via @analogjs/vite-plugin-angular) | 21.1.1 / 2.2.2 |
| Package Manager    | Bun                                                    | >= 1.x         |
| Unit Testing       | Vitest + jsdom                                         | 4.0.18         |
| E2E Testing        | Playwright                                             | 1.58.0         |
| Formatting         | Prettier                                               | 3.8.1          |
| Git Hooks          | Husky + lint-staged                                    | 9.1.7 / 16.2.7 |
| Runtime            | Node.js                                                | >= 20.11.1     |

### Application Type

Single-page application (SPA) using **Angular Standalone Components** (no NgModules). All components, directives, and pipes are declared as `standalone: true` and import their dependencies directly.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser (SPA)                     │
├─────────────────────────────────────────────────────┤
│  Layout Layer        │  HeaderComponent              │
│                      │  FooterComponent              │
├──────────────────────┼──────────────────────────────┤
│  Feature Modules     │  Article (CRUD, list, meta)   │
│                      │  Auth (login, register)       │
│                      │  Profile (view, follow)       │
│                      │  Settings (edit user)         │
├──────────────────────┼──────────────────────────────┤
│  Core Services       │  UserService, JwtService      │
│                      │  HTTP Interceptors (3)        │
│                      │  Auth Guards & Directives     │
├──────────────────────┼──────────────────────────────┤
│  Shared              │  ListErrorsComponent          │
│                      │  MarkdownPipe, ImageFallback  │
├─────────────────────────────────────────────────────┤
│                External REST API                     │
│         (Conduit API — api.realworld.io)             │
└─────────────────────────────────────────────────────┘
```

### Communication Pattern

- **Client ↔ Backend:** RESTful HTTP via Angular `HttpClient`
- **State Management:** RxJS `BehaviorSubject` in `UserService` (no NgRx/Akita/Elf)
- **Reactive Rendering:** `@rx-angular/template` push pipe (`*rxLet`, `rxFor`) for change-detection-optimized rendering

---

## 2. Project Structure

```
src/
├── app/
│   ├── app.component.ts          # Root component (router-outlet + header/footer)
│   ├── app.config.ts             # Application config (providers, interceptors, routes)
│   ├── app.routes.ts             # Top-level route definitions (lazy-loaded)
│   ├── core/
│   │   ├── auth/
│   │   │   ├── auth.component.ts         # Login/Register page
│   │   │   ├── auth.routes.ts            # /login, /register routes
│   │   │   ├── auth-guard.ts             # canActivate guard (redirects unauthenticated users)
│   │   │   ├── auth.directive.ts         # *appShowAuthed structural directive
│   │   │   ├── user.model.ts             # User interface
│   │   │   └── services/
│   │   │       ├── jwt.service.ts        # localStorage JWT CRUD
│   │   │       ├── user.service.ts       # Auth state, login/register/logout/update
│   │   │       ├── jwt.service.spec.ts   # Unit tests
│   │   │       └── user.service.spec.ts  # Unit tests
│   │   ├── interceptors/
│   │   │   ├── api.interceptor.ts        # Prefixes API base URL
│   │   │   ├── token.interceptor.ts      # Attaches JWT Authorization header
│   │   │   └── error.interceptor.ts      # Normalizes HTTP errors
│   │   ├── layout/
│   │   │   ├── header.component.ts       # Top nav bar (auth-aware)
│   │   │   └── footer.component.ts       # Footer with attribution
│   │   └── models/
│   │       ├── errors.model.ts           # Errors type (Record<string, string[]>)
│   │       └── loading-state.model.ts    # LoadingState enum (NOT_LOADED, LOADING, LOADED)
│   ├── features/
│   │   ├── article/
│   │   │   ├── models/                   # Article, Comment, ArticleListConfig
│   │   │   ├── services/                 # ArticlesService, CommentsService, TagsService
│   │   │   ├── components/               # ArticleListComponent, ArticlePreviewComponent,
│   │   │   │                             # ArticleMetaComponent, FavoriteButtonComponent
│   │   │   └── pages/
│   │   │       ├── home/                 # HomeComponent (global/feed tabs + tag filter)
│   │   │       ├── editor/               # EditorComponent (create/edit article)
│   │   │       └── article-page/         # ArticleComponent (detail + comments)
│   │   ├── profile/
│   │   │   ├── models/                   # Profile interface
│   │   │   ├── services/                 # ProfileService
│   │   │   ├── components/               # FollowButtonComponent
│   │   │   └── pages/                    # ProfileComponent (user articles/favorites)
│   │   └── settings/
│   │       └── settings.component.ts     # SettingsComponent (edit user profile form)
│   └── shared/
│       ├── components/
│       │   └── list-errors.component.ts  # Reusable error list display
│       └── pipes/
│           ├── markdown.pipe.ts          # Renders markdown → safe HTML
│           └── image-fallback.pipe.ts    # Provides fallback for broken avatar URLs
├── environments/
│   └── environment.ts                    # API base URL configuration
├── styles.css                            # Conduit Minimal CSS v3 (global styles)
├── index.html                            # SPA entry point
└── main.ts                               # Angular bootstrap
```

---

## 3. Data Model Documentation

### User

```typescript
interface User {
  email: string;
  token: string;
  username: string;
  bio: string | null;
  image: string | null;
}
```

### Profile

```typescript
interface Profile {
  username: string;
  bio: string;
  image: string;
  following: boolean;
}
```

### Article

```typescript
interface Article {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  createdAt: string;
  updatedAt: string;
  favorited: boolean;
  favoritesCount: number;
  author: Profile;
}
```

### Comment

```typescript
interface Comment {
  id: number;
  createdAt: string;
  updatedAt: string;
  body: string;
  author: Profile;
}
```

### ArticleListConfig

```typescript
interface ArticleListConfig {
  type: 'all' | 'feed';
  filters: {
    tag?: string;
    author?: string;
    favorited?: string;
    limit?: number;
    offset?: number;
  };
}
```

### Errors

```typescript
type Errors = Record<string, string[]>;
```

### LoadingState

```typescript
enum LoadingState {
  NOT_LOADED = 'NOT_LOADED',
  LOADING = 'LOADING',
  LOADED = 'LOADED',
}
```

---

## 4. API Surface Map

The app communicates with the Conduit backend API. Base URL is configured in `environment.ts` and prepended by `apiInterceptor`.

### Authentication

| Method | Endpoint       | Purpose             | Auth Required |
| ------ | -------------- | ------------------- | ------------- |
| POST   | `/users/login` | Sign in             | No            |
| POST   | `/users`       | Register new user   | No            |
| GET    | `/user`        | Get current user    | Yes           |
| PUT    | `/user`        | Update current user | Yes           |

### Articles

| Method | Endpoint          | Purpose                   | Auth Required |
| ------ | ----------------- | ------------------------- | ------------- |
| GET    | `/articles`       | List articles (global)    | No            |
| GET    | `/articles/feed`  | List articles (user feed) | Yes           |
| GET    | `/articles/:slug` | Get single article        | No            |
| POST   | `/articles/`      | Create article            | Yes           |
| PUT    | `/articles/:slug` | Update article            | Yes           |
| DELETE | `/articles/:slug` | Delete article            | Yes           |

### Favorites

| Method | Endpoint                   | Purpose               | Auth Required |
| ------ | -------------------------- | --------------------- | ------------- |
| POST   | `/articles/:slug/favorite` | Favorite an article   | Yes           |
| DELETE | `/articles/:slug/favorite` | Unfavorite an article | Yes           |

### Comments

| Method | Endpoint                       | Purpose                   | Auth Required |
| ------ | ------------------------------ | ------------------------- | ------------- |
| GET    | `/articles/:slug/comments`     | List comments for article | No            |
| POST   | `/articles/:slug/comments`     | Add comment               | Yes           |
| DELETE | `/articles/:slug/comments/:id` | Delete comment            | Yes           |

### Tags

| Method | Endpoint | Purpose      | Auth Required |
| ------ | -------- | ------------ | ------------- |
| GET    | `/tags`  | Get all tags | No            |

### Profiles

| Method | Endpoint                     | Purpose          | Auth Required |
| ------ | ---------------------------- | ---------------- | ------------- |
| GET    | `/profiles/:username`        | Get user profile | No            |
| POST   | `/profiles/:username/follow` | Follow user      | Yes           |
| DELETE | `/profiles/:username/follow` | Unfollow user    | Yes           |

---

## 5. Key Business Logic Inventory

### Authentication & Session Management

- **JWT Storage:** `JwtService` persists tokens in `localStorage` under key `jwtToken`
- **Auth State:** `UserService` maintains a `BehaviorSubject<User | null>` with derived `isAuthenticated` observable via `distinctUntilChanged` + `map`
- **Login Flow:** POST credentials → receive user object with token → `setAuth()` saves token and updates subject
- **Registration Flow:** POST credentials → same `setAuth()` path
- **Logout Flow:** `purgeAuth()` destroys token, sets user to null, navigates to `/`
- **Session Hydration:** `getCurrentUser()` calls `GET /user` on app init, uses `shareReplay` to deduplicate requests; on error, calls `purgeAuth()`

### Article Management

- **Feed vs. Global:** `ArticleListConfig.type` toggles between `/articles` (global) and `/articles/feed` (personalized)
- **Pagination:** Offset-based via `limit` and `offset` query params
- **Tag Filtering:** Articles can be filtered by tag via the home page sidebar
- **Editor:** Single `EditorComponent` handles both create (POST) and edit (PUT) flows based on presence of slug in route params
- **Markdown Rendering:** Article body is rendered via `MarkdownPipe` using the `marked` library, sanitized through Angular's `DomSanitizer`

### Social Features

- **Favorites:** Toggle favorite via POST/DELETE on `/articles/:slug/favorite`; optimistic count shown on `ArticlePreviewComponent`
- **Follow/Unfollow:** Toggle via POST/DELETE on `/profiles/:username/follow`; reflected in `FollowButtonComponent`

### User Profile & Settings

- **Profile Page:** Displays user info, their authored articles, and their favorited articles (tabbed)
- **Settings:** Edit form for image URL, username, bio, email, and password; submits via `PUT /user`

---

## 6. HTTP Interceptor Chain

Three functional interceptors are registered in order in `app.config.ts`:

1. **`apiInterceptor`** — Prepends the API base URL (`environment.api_url`) to all relative requests
2. **`tokenInterceptor`** — Reads JWT from `JwtService`; if present, clones the request with `Authorization: Token <jwt>` header
3. **`errorInterceptor`** — Catches HTTP errors; for `401 Unauthorized`, calls `UserService.purgeAuth()` to force logout; normalizes errors into a consistent format for downstream consumers

---

## 7. Routing Architecture

All feature routes are **lazy-loaded** via dynamic `import()` in `app.routes.ts`:

| Route                          | Component/Module                 | Guard     |
| ------------------------------ | -------------------------------- | --------- |
| `/`                            | HomeComponent                    | —         |
| `/login`                       | AuthComponent                    | —         |
| `/register`                    | AuthComponent                    | —         |
| `/settings`                    | SettingsComponent                | AuthGuard |
| `/editor`                      | EditorComponent                  | AuthGuard |
| `/editor/:slug`                | EditorComponent                  | AuthGuard |
| `/article/:slug`               | ArticleComponent                 | —         |
| `/profile/:username`           | ProfileComponent                 | —         |
| `/profile/:username/favorites` | ProfileComponent (favorites tab) | —         |

### Auth Guard

`authGuard` checks `UserService.isAuthenticated`; if `false`, redirects to `/` (home page).

### Auth Directive

`ShowAuthedDirective` (`*appShowAuthed`) conditionally renders template content based on authentication state — used in the header to toggle navigation links.

---

## 8. Integration Points

### External API

- **Conduit Backend API** — The sole external dependency. Base URL configured in `src/environments/environment.ts`. All data operations (CRUD, auth, social) go through this REST API.

### Third-Party Libraries

| Library                | Purpose                                           | Usage Location                        |
| ---------------------- | ------------------------------------------------- | ------------------------------------- |
| `marked`               | Markdown-to-HTML rendering                        | `MarkdownPipe` (article body display) |
| `@rx-angular/template` | Push-based reactive rendering (`*rxLet`, `rxFor`) | Components across the app             |
| `@rx-angular/cdk`      | Reactive utilities                                | Supporting `@rx-angular/template`     |

### Browser APIs

- **`localStorage`** — JWT token persistence (via `JwtService`)
- **No other browser APIs** (no WebSockets, Service Workers, IndexedDB, etc.)

---

## 9. Build and Deployment Summary

### Scripts

| Script         | Command              | Purpose                 |
| -------------- | -------------------- | ----------------------- |
| `start`        | `ng serve`           | Dev server on port 4200 |
| `build`        | `ng build`           | Production build        |
| `test`         | `vitest`             | Run unit tests          |
| `test:ui`      | `vitest --ui`        | Interactive test UI     |
| `test:e2e`     | `playwright test`    | Run E2E tests           |
| `format`       | `prettier --write .` | Auto-format all files   |
| `format:check` | `prettier --check .` | Verify formatting (CI)  |
| `prepare`      | `husky`              | Install git hooks       |

### Build Pipeline

- **Dev:** `bun run start` → Angular CLI dev server with Vite HMR
- **Production:** `bun run build` → Ahead-of-time compiled, tree-shaken bundle
- **Pre-commit:** Husky + lint-staged runs `prettier --write` on staged files before each commit

### Test Infrastructure

- **Unit Tests (6 spec files):** Vitest with jsdom environment, Angular TestBed, `HttpTestingController` for HTTP mocking
  - `jwt.service.spec.ts` — 30+ tests covering token CRUD, edge cases, security
  - `user.service.spec.ts` — 20+ tests covering auth flow, state management
  - `articles.service.spec.ts` — 15+ tests covering article CRUD, query, favorites
  - `comments.service.spec.ts` — Comment CRUD operations
  - `tags.service.spec.ts` — Tag fetching
  - `profile.service.spec.ts` — Profile and follow/unfollow operations
- **E2E Tests (12 spec files):** Playwright browser tests
  - `auth.spec.ts` — Login/register flows
  - `articles.spec.ts` — Article CRUD
  - `comments.spec.ts` — Comment operations
  - `navigation.spec.ts` — Page navigation
  - `settings.spec.ts` — User settings
  - `social.spec.ts` — Follow/favorite
  - `health.spec.ts` — App health checks
  - `error-handling.spec.ts` — Error scenarios
  - `xss-security.spec.ts` — XSS prevention
  - `null-fields.spec.ts` — Null data handling
  - `url-navigation.spec.ts` — Direct URL access
  - `user-fetch-errors.spec.ts` — User fetch failure handling

---

## 10. Configuration

### Environment Configuration

```typescript
// src/environments/environment.ts
export const environment = {
  api_url: 'https://api.realworld.io/api',
};
```

### TypeScript Configuration

- **Target:** ES2022
- **Strict mode:** Enabled
- **Angular compiler options:** Standalone components default

### Prettier Configuration

- Uses default Prettier settings with project-level config
- Enforced via `lint-staged` on pre-commit

### Vitest Configuration

- Environment: `jsdom`
- Plugin: `@analogjs/vite-plugin-angular`
- Globals: disabled (explicit imports from `vitest`)
