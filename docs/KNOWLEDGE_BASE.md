# Knowledge Base — Angular RealWorld Example App (Conduit)

## 1. Architecture Overview

### High-Level Summary

This is a **single-page application (SPA)** built with **Angular 21** implementing the [RealWorld](https://realworld.show) "Conduit" specification — a Medium.com clone demonstrating CRUD, authentication, routing, and pagination against a shared backend API.

### Architecture Pattern

| Aspect           | Choice                                                   |
| ---------------- | -------------------------------------------------------- |
| Framework        | Angular 21 (standalone components, signals, zoneless)    |
| Build System     | Angular CLI + Vite (`@angular/build:application`)        |
| Package Manager  | Bun                                                      |
| State Management | RxJS BehaviorSubjects + Angular Signals (no NgRx/store)  |
| Rendering        | `@rx-angular/template` for performant reactive rendering |
| Change Detection | `OnPush` everywhere + `provideZonelessChangeDetection()` |
| Styling          | Single global CSS file (`styles.css`, ~1400 lines)       |
| Testing (Unit)   | Vitest with `@analogjs/vite-plugin-angular`              |
| Testing (E2E)    | Playwright (Chromium only, serial execution)             |
| Formatting       | Prettier + Husky + lint-staged                           |
| Backend API      | External: `https://api.realworld.show/api`               |
| Deployment       | Static SPA with `_redirects` (Netlify/Cloudflare-style)  |

### Module Structure

```
src/app/
├── app.component.ts          # Root shell (header + router-outlet + footer)
├── app.config.ts             # DI providers, interceptors, app initializer
├── app.routes.ts             # Top-level route definitions with lazy loading
├── core/                     # Singleton services, interceptors, layout
│   ├── auth/                 # Auth component, UserService, JwtService, directive
│   ├── interceptors/         # API prefix, token attachment, error handling
│   ├── layout/               # Header and footer components
│   └── models/               # Shared types (Errors, LoadingState)
├── features/                 # Domain-specific feature modules
│   ├── article/              # Articles CRUD, comments, tags, home page, editor
│   ├── profile/              # User profiles, follow/unfollow
│   └── settings/             # User settings page
└── shared/                   # Reusable pipes and components
    ├── components/           # ListErrorsComponent
    └── pipes/                # MarkdownPipe, DefaultImagePipe
```

### Key Architectural Decisions

1. **Standalone Components** — No NgModules; every component is standalone with explicit `imports`.
2. **Zoneless** — Uses `provideZonelessChangeDetection()` for better performance.
3. **Lazy Loading** — All feature pages are lazy-loaded via `loadComponent()`.
4. **Functional Interceptors** — HTTP interceptors are plain functions, not class-based.
5. **Signal-based State** — Components use Angular signals (`signal()`) for local state.
6. **Debug Interface** — Exposes `window.__conduit_debug__` for E2E test state inspection.

---

## 2. Data Models

### User

| Field      | Type             | Description              |
| ---------- | ---------------- | ------------------------ |
| `email`    | `string`         | User email address       |
| `token`    | `string`         | JWT authentication token |
| `username` | `string`         | Unique username          |
| `bio`      | `string \| null` | User biography           |
| `image`    | `string \| null` | Avatar URL               |

### Profile

| Field       | Type             | Description                               |
| ----------- | ---------------- | ----------------------------------------- |
| `username`  | `string`         | Profile username                          |
| `bio`       | `string \| null` | User biography                            |
| `image`     | `string \| null` | Avatar URL                                |
| `following` | `boolean`        | Whether current user follows this profile |

### Article

| Field            | Type       | Description                    |
| ---------------- | ---------- | ------------------------------ |
| `slug`           | `string`   | URL-friendly unique identifier |
| `title`          | `string`   | Article title                  |
| `description`    | `string`   | Short description              |
| `body`           | `string`   | Markdown article body          |
| `tagList`        | `string[]` | Associated tags                |
| `createdAt`      | `string`   | ISO timestamp                  |
| `updatedAt`      | `string`   | ISO timestamp                  |
| `favorited`      | `boolean`  | Whether current user favorited |
| `favoritesCount` | `number`   | Total favorites count          |
| `author`         | `Profile`  | Author profile                 |

### Comment

| Field       | Type      | Description            |
| ----------- | --------- | ---------------------- |
| `id`        | `string`  | Comment ID             |
| `body`      | `string`  | Comment text           |
| `createdAt` | `string`  | ISO timestamp          |
| `author`    | `Profile` | Comment author profile |

### ArticleListConfig

| Field               | Type      | Description              |
| ------------------- | --------- | ------------------------ |
| `type`              | `string`  | `"all"` or `"feed"`      |
| `filters.tag`       | `string?` | Filter by tag            |
| `filters.author`    | `string?` | Filter by author         |
| `filters.favorited` | `string?` | Filter by favorited user |
| `filters.limit`     | `number?` | Page size                |
| `filters.offset`    | `number?` | Pagination offset        |

### Errors

```typescript
interface Errors {
  errors: { [key: string]: string };
}
```

### AuthState (Union Type)

```typescript
type AuthState = 'authenticated' | 'unauthenticated' | 'unavailable' | 'loading';
```

---

## 3. API Surface Map

All requests are proxied through `apiInterceptor` which prefixes URLs with `https://api.realworld.show/api`.

### Authentication

| Method | Endpoint       | Description                    | Auth Required |
| ------ | -------------- | ------------------------------ | ------------- |
| `POST` | `/users/login` | Login with email/password      | No            |
| `POST` | `/users`       | Register new user              | No            |
| `GET`  | `/user`        | Get current authenticated user | Yes           |
| `PUT`  | `/user`        | Update current user settings   | Yes           |

### Articles

| Method   | Endpoint                   | Description                       | Auth Required |
| -------- | -------------------------- | --------------------------------- | ------------- |
| `GET`    | `/articles`                | List articles (with query params) | No            |
| `GET`    | `/articles/feed`           | Get user's feed                   | Yes           |
| `GET`    | `/articles/:slug`          | Get single article                | No            |
| `POST`   | `/articles/`               | Create article                    | Yes           |
| `PUT`    | `/articles/:slug`          | Update article                    | Yes           |
| `DELETE` | `/articles/:slug`          | Delete article                    | Yes           |
| `POST`   | `/articles/:slug/favorite` | Favorite an article               | Yes           |
| `DELETE` | `/articles/:slug/favorite` | Unfavorite an article             | Yes           |

### Comments

| Method   | Endpoint                       | Description              | Auth Required |
| -------- | ------------------------------ | ------------------------ | ------------- |
| `GET`    | `/articles/:slug/comments`     | Get comments for article | No            |
| `POST`   | `/articles/:slug/comments`     | Add comment              | Yes           |
| `DELETE` | `/articles/:slug/comments/:id` | Delete comment           | Yes           |

### Profiles

| Method   | Endpoint                     | Description      | Auth Required |
| -------- | ---------------------------- | ---------------- | ------------- |
| `GET`    | `/profiles/:username`        | Get user profile | No            |
| `POST`   | `/profiles/:username/follow` | Follow user      | Yes           |
| `DELETE` | `/profiles/:username/follow` | Unfollow user    | Yes           |

### Tags

| Method | Endpoint | Description  | Auth Required |
| ------ | -------- | ------------ | ------------- |
| `GET`  | `/tags`  | Get all tags | No            |

---

## 4. Business Logic Inventory

### Authentication Flow

1. **App Initialization** (`initAuth` in `app.config.ts`):
   - If token exists in localStorage → calls `GET /user` to validate
   - If 4XX response → token invalid, calls `purgeAuth()`
   - If 5XX/network error → enters `'unavailable'` state, retries with exponential backoff (2s → 4s → 8s → 16s cap)
   - If no token → immediately sets state to `'unauthenticated'`

2. **Login/Register**: Posts credentials → on success, saves token, sets user, navigates to `/`

3. **Logout**: Destroys token, clears user subject, navigates to `/`

4. **Global 401 Handling**: `errorInterceptor` catches 401 on all endpoints except `/user` → calls `purgeAuth()`

### Route Guards

- `requireAuth`: Redirects to `/login` if not authenticated (used on settings, editor)
- Login/Register guard: Redirects away if already authenticated

### Article Management

- **Create/Edit**: Editor component handles both (slug param presence determines mode)
- **Authorization**: Only article author can edit (checked in editor via username comparison)
- **Favoriting**: Requires auth; redirects to `/register` if unauthenticated
- **Pagination**: Client-side page calculation with limit/offset query params

### Comment Management

- **Add**: Authenticated users can post comments
- **Delete**: Only comment author sees delete icon (checked via username)

### Profile & Social

- **Follow/Unfollow**: Requires auth; redirects to `/login` if unauthenticated
- **Profile Detection**: Compares current user's username with viewed profile

### Content Rendering

- **Markdown**: Article body rendered via `marked` library with Angular `DomSanitizer` (XSS protection)
- **Default Images**: Null/undefined avatar URLs replaced with local SVG fallback

---

## 5. Integration Points

### External Services

| Integration  | Details                                                             |
| ------------ | ------------------------------------------------------------------- |
| Backend API  | `https://api.realworld.show/api` — full RealWorld spec REST API     |
| Ionicons CDN | `//code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css`     |
| Google Fonts | Titillium Web, Source Serif Pro, Merriweather Sans, Source Sans Pro |

### Internal Integration Patterns

| Pattern                 | Implementation                                                            |
| ----------------------- | ------------------------------------------------------------------------- |
| Token Storage           | `localStorage['jwtToken']` via `JwtService`                               |
| HTTP Interceptor Chain  | `apiInterceptor` → `tokenInterceptor` → `errorInterceptor`                |
| Auth State Propagation  | `BehaviorSubject<AuthState>` with `distinctUntilChanged()`                |
| Component Communication | `@Input`/`@Output` + signals for parent-child; services for cross-cutting |
| Debug/Test Bridge       | `window.__conduit_debug__` exposing token, auth state, current user       |

---

## 6. Build and Deployment Summary

### Build Pipeline

| Command                | Tool                   | Purpose                                    |
| ---------------------- | ---------------------- | ------------------------------------------ |
| `bun install`          | Bun                    | Install dependencies                       |
| `bun run build`        | Angular CLI + Vite     | Production build → `dist/angular-conduit/` |
| `bun run start`        | Angular CLI dev server | Development at `localhost:4200`            |
| `bun run test --run`   | Vitest                 | Unit tests (single run)                    |
| `bun run test:e2e`     | Playwright             | E2E tests (Chromium, serial)               |
| `bun run format`       | Prettier               | Code formatting                            |
| `bun run format:check` | Prettier               | CI formatting validation                   |

### Production Build Configuration

- **Output**: `dist/angular-conduit/` with hashed filenames
- **Budgets**: Initial bundle ≤ 500 KB warning / 1 MB error; component styles ≤ 2 KB warning / 4 KB error
- **SPA Routing**: `_redirects` file (`/* /index.html 200`) for catch-all routing
- **No SSR**: Client-side only rendering

### Quality Gates

- **Pre-commit**: Husky + lint-staged runs Prettier on staged `*.{ts,html,css,json,md}` files
- **TypeScript**: Strict mode enabled (`strict: true`, `noImplicitReturns`, `noFallthroughCasesInSwitch`)
- **Angular Compiler**: `strictTemplates`, `strictInjectionParameters`, `strictInputAccessModifiers`

### Test Coverage

| Layer           | Tool           | Files                                                                                                                                                                |
| --------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit (Services) | Vitest + jsdom | `jwt.service.spec.ts`, `user.service.spec.ts`, `articles.service.spec.ts`, `comments.service.spec.ts`, `tags.service.spec.ts`, `profile.service.spec.ts`             |
| E2E (Workflows) | Playwright     | `auth`, `articles`, `comments`, `settings`, `social`, `navigation`, `url-navigation`, `error-handling`, `null-fields`, `health`, `user-fetch-errors`, `xss-security` |
