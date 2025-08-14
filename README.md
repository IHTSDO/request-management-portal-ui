# Request Management Portal UI

![Last Commit](https://img.shields.io/github/last-commit/ihtsdo/request-management-portal-ui/develop)
![Issues](https://img.shields.io/github/issues/ihtsdo/request-management-portal-ui)
![Contributors](https://img.shields.io/github/contributors/ihtsdo/request-management-portal-ui)
![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)
![Commit activity](https://img.shields.io/github/commit-activity/m/ihtsdo/request-management-portal-ui/develop)
![Angular Version](https://img.shields.io/github/package-json/dependency-version/ihtsdo/request-management-portal-ui/@angular/core)
![Typescript Version](https://img.shields.io/github/package-json/dependency-version/ihtsdo/request-management-portal-ui/dev/typescript)

A single-page application (SPA) built with **Angular 19**, **TailwindCSS** and **Node/Express SSR** that allows SNOMED International managed-service customers to raise structured requests that are turned into Jira tickets.

---

## Table of Contents
1. Overview
2. Architecture
3. Prerequisites
4. Getting Started
5. NPM Scripts
6. Project Structure
7. Styling & Design
8. Internationalisation (i18n)
9. Coding Standards & Best Practices
10. Branching & Commit Conventions
11. Features
12. CI/CD & Quality Gates
13. Deployment
14. Security
15. Contributing
16. License

---

## 1. Overview
The portal offers a user-friendly dashboard for creating, tracking and managing requests. When a form is submitted the server creates a corresponding Jira issue via the internal API.

Key characteristics:
* Modern Angular application with **Server-Side Rendering (SSR)**.
* **Responsive** UI powered by **TailwindCSS**.
* Multi-language support through **ngx-translate** and JSON translation bundles.
* Strict **TypeScript** configuration and RxJS best practices.
* Designed for containerised deployment.

## 2. Architecture
```
+--------------+    SSR build     +-------------------+
|  Angular App | ---------------> |    Node/Express   |
|  (browser)   | <--------------- |  CommonEngine SSR |
+--------------+    HTML stream   +-------------------+
```

At build time Angular CLI outputs both **browser** and **server** bundles. `server.ts` starts an Express server that uses `@angular/ssr`'s `CommonEngine` to render pages. Static assets are served from the `browser` folder with long-term caching.

## 3. Prerequisites
* **Node.js 22.7.0+** (aligned with `@types/node` in `package.json`).
* **npm 10.8.2** or **pnpm 8+** (the repository is npm-centric but compatible with pnpm).
* **Angular CLI 19+** installed globally for convenience: `npm i -g @angular/cli`.
* **Jira credentials** (service account) and other secrets exported as environment variables for production deployment.

## 4. Getting Started
```bash
# 1. Clone
$ git clone https://github.com/ihtsdo/request-management-portal-ui.git
$ cd request-management-portal-ui

# 2. Install dependencies
$ npm ci     # reproducible install
# or: pnpm i

# 3. Start the dev server (HMR, no SSR)
$ npm start  # alias for `ng serve` -> http://localhost:4200/

# 4. Lint & unit tests in watch mode (optional)
$ npm run lint
$ npm t -- --watch
```

### Running with SSR locally
```bash
# Build browser + server bundles in development mode
npm run build

# Start node server (auto reload via nodemon is recommended)
node dist/request-management-portal-ui/server/main.mjs
# -> http://localhost:4000
```

### Environment variables
| Variable | Purpose | Default |
|----------|---------|---------|
| `PORT` | Port Express listens on | `4000` |
| `JIRA_BASE_URL` | Jira REST API endpoint | – |
| `JIRA_USERNAME` | Service-account user | – |
| `JIRA_TOKEN` | API token/password | – |

Create a `.env` file for local experiments; **never commit secrets**.

## 5. NPM Scripts
| Command | Description |
|---------|-------------|
| `npm start` | Alias for `ng serve` (dev, no SSR) |
| `npm run build` | Production build incl. SSR (default configuration) |
| `npm run build:prod` | Explicit production build with budgets enforced |
| `npm run watch` | Rebuild on file changes (development config) |

> The Angular CLI configuration resides in `angular.json`. Adjust or extend build targets there.

## 6. Project Structure
```
├── src/
│   ├── app/                 # Angular feature & shared modules
│   │   ├── components/      # Presentational and container components
│   │   ├── services/        # Singleton providers (REST, auth, etc.)
│   │   ├── interceptors/    # HTTP interceptors
│   │   ├── pipes/           # Pure pipes
│   │   └── models/          # TypeScript interfaces
│   ├── public/              # Static assets (copied verbatim)
│   ├── styles.scss          # Tailwind & global styles
│   └── main.ts              # Browser bootstrap
├── server.ts                # Express entry point (SSR)
└── angular.json             # Angular CLI project config
```

The repository follows the **feature-based folder structure** recommended by the Angular Style Guide.

## 7. Styling & Design
* **TailwindCSS 4** provides utility-first classes.
* Global SCSS variables/mixins can be placed in `src/styles` and imported via `@use`.
* Follow the **BEM** methodology for any custom component styles.

## 8. Internationalisation (i18n)
Translations reside in `public/i18n/{lang}.json` and are loaded via `ngx-translate`. Add new keys in **English first**, then provide translations for other languages. Use the dedicated **TranslatePipe** rather than hard-coded strings.

## 9. Coding Standards & Best Practices
* **Angular Style Guide**: Prefer _stand-alone components_, `OnPush` change detection, and `@Input` immutability.
* **TypeScript**: `strict` mode is enabled; avoid the `any` type.
* **RxJS**: use `takeUntil` and the async pipe to manage subscriptions; avoid manual `subscribe` where possible.
* **State management**: co-locate component state; introduce a dedicated library (NgRx, NGXS, etc.) only when complexity demands it.
* **Routing**: lazy-load feature routes; keep modules shallow.

## 10. Branching & Commit Conventions
* **`develop`** – default integration branch.
* **`master`** – production releases.
* **feature/**`xyz`, **bugfix/**`xyz`, **hotfix/**`xyz` – short-lived topic branches.

Commits follow **Conventional Commits**:
```
feat(auth): add OIDC login flow
fix(request): correct date validation
chore(ci): upgrade node version in pipeline
```

This enables automatic changelog generation and semantic versioning.

## 11. Features
The portal provides the following key capabilities:

- **Dashboard overview** – see [`src/app/components/dashboard`](https://github.com/IHTSDO/request-management-portal-ui/tree/develop-v2/src/app/components/dashboard)
- **Request submission forms** – [`src/app/components/request`](https://github.com/IHTSDO/request-management-portal-ui/tree/develop-v2/src/app/components/request)
- **Request management list & filters** – [`src/app/components/request-management`](https://github.com/IHTSDO/request-management-portal-ui/tree/develop-v2/src/app/components/request-management)
- **SNOMED navigation bar with language switching** – [`src/app/components/snomed-navbar`](https://github.com/IHTSDO/request-management-portal-ui/tree/develop-v2/src/app/components/snomed-navbar)
- **Authentication & session handling** – [`src/app/services/authentication`](https://github.com/IHTSDO/request-management-portal-ui/tree/develop-v2/src/app/services/authentication)
- **Language & i18n service** – [`src/app/services/language`](https://github.com/IHTSDO/request-management-portal-ui/tree/develop-v2/src/app/services/language)
- **Authoring service for creating requests** – [`src/app/services/authoring`](https://github.com/IHTSDO/request-management-portal-ui/tree/develop-v2/src/app/services/authoring)
- **IMS integration service** – [`src/app/services/ims`](https://github.com/IHTSDO/request-management-portal-ui/tree/develop-v2/src/app/services/ims)
- **HTTP interceptors for auth and headers** – [`src/app/interceptors`](https://github.com/IHTSDO/request-management-portal-ui/tree/develop-v2/src/app/interceptors)
- **Notification system via Toastr** – implementation across components (see example in each `*.component.ts`)

## 12. CI/CD & Quality Gates
A GitHub Actions workflow runs on every PR:
1. Install dependencies with cache
2. Lint & format check
3. Run unit tests & collect coverage
4. Build production artefacts
5. Upload results to **SonarCloud** (security, coverage, smells)

A green build is required before merging.

## 13. Deployment
1. Build: `npm run build:prod`
2. Copy `dist/request-management-portal-ui` to your server/container image.
3. Start: `node server/main.mjs` (or via `pm2`, `docker-compose`, etc.)

A **Dockerfile**/Helm chart will be added in a future iteration.

## 14. Security
* Keep dependencies updated (`npm audit --production`).
* Sanitize all form inputs on both client and server.
* Use HTTPS & HSTS in production (configure the reverse proxy, not Express).
* Secrets are injected via environment variables / vault – **never commit them**.

## 15. Contributing
We welcome contributions! Please:
1. Open an **issue** to discuss the enhancement.
2. Create a branch from `develop`.
3. Follow the coding standards and add tests.
4. Submit a **draft PR** early; add the `ready-for-review` label when finished.

## 16. License
Apache-2.0 © SNOMED International. See [`LICENSE.md`](LICENSE.md) for details.
