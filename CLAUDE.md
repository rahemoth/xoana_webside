# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

XOANA is an e-commerce website for an independent fingerboard (finger skateboard) brand. Spring Boot 3.2 backend (Java 17) + Next.js frontend (TypeScript). This is a university course project with mock payments.

## Commands

### Frontend (`frontend/`)
```bash
pnpm dev          # Start Next.js dev server (port 3000)
pnpm build        # Production build
pnpm start        # Serve production build
pnpm lint         # ESLint
```
**Use `pnpm`, not npm.** The `packageManager` field in `package.json` pins pnpm@10.23.0.

### Backend (`backend/`)
```bash
mvn spring-boot:run       # Start Spring Boot (port 8080)
mvn test                   # Run tests (only a context-load smoke test exists)
```

### Full Stack
1. Start MySQL, create database `xoana`
2. `cd backend && mvn spring-boot:run`
3. `cd frontend && pnpm dev`
4. Frontend at http://localhost:3000, API at http://localhost:8080

## Architecture

### Backend (`com.xoana`)
- **Standard Spring Boot layered architecture**: Controller → Repository (no separate Service layer — controllers call repositories directly)
- **Security**: Stateless JWT auth via `JwtAuthFilter` (OncePerRequestFilter). Tokens issued by `AuthController.login()`, validated on every request. HMAC-SHA256, 24h expiry, secret in `application.yml`
- **Public endpoints** (no auth): `/api/auth/**`, `/api/products/**`, `/api/articles/**`, `/api/settings`, `/uploads/**`, `/api/traffic/track`
- **Auth endpoints**: `/api/admin/**`, `/api/users/**`, `/api/orders/**`, `/api/contact/**` require `ROLE_ADMIN` or `ROLE_USER`
- **Roles**: `USER` and `ADMIN` — stored as enum on the `User` entity
- **Soft delete for products**: `ProductController.deleteProduct()` sets `active=false` rather than removing the row
- **SiteSettings**: Singleton pattern — always id=1, initialized by `DataInitializer` if absent
- **File uploads**: Stored to `./uploads/` on disk, served via Spring static resource handler (`WebConfig`)

### Frontend (`frontend/src`)
- **Next.js 16 App Router** with TypeScript (not Next.js 14 as the README states — the AGENTS.md warning about breaking changes is relevant)
- **State management**: Zustand with `persist` middleware (localStorage key: `xoana-store`) — holds auth token, user info, and cart
- **Data fetching**: TanStack Query (React Query) + Axios
- **Styling**: Tailwind CSS v4 (CSS-based config via `@tailwindcss/postcss`, no `tailwind.config.js`)
- **i18n**: next-intl with locales `zh` (Chinese) and `en` (English). Locale persisted in a cookie, read in `src/i18n.ts`
- **Theming**: next-themes (light/dark, defaults to light)
- **Traffic tracking**: `LayoutShell` fires `POST /api/traffic/track` on every public page navigation
- **Admin layout**: Client-side role check — non-ADMIN users redirected to `/login`

### API Client (`frontend/src/lib/api.ts`)
Axios instance with request interceptor (attaches JWT Bearer token from Zustand store) and response interceptor (redirects to `/login` on 401/403).

### Data Model (8 JPA entities)
- **User** → **Order** (1:N)
- **Order** → **OrderItem** (1:N)
- **OrderItem** → **Product** (N:1)
- **SiteTraffic**, **Article**, **SiteSettings**, **ContactMessage** are standalone
- Most entities have bilingual fields (`name`/`nameEn`, `description`/`descriptionEn`, `title`/`titleEn`, `content`/`contentEn`) for zh/en support

## Important Gotchas

### Default accounts (from `DataInitializer.java` — NOT the README)
| Username | Password | Role |
|----------|----------|------|
| `jacky` | `jacky060620` | ADMIN |
| `test` | `test123` | USER |

The README says `admin/admin123` but that account does not exist in code.

### Active profile is `prod`, not `dev`
`application.yml` sets `spring.profiles.active: prod`. Running the backend connects to MySQL at `localhost:3306/xoana` (user: `xoana`). Use `-Dspring.profiles.active=dev` for H2 in-memory database.

### Next.js version
The frontend uses **Next.js 16** (React 19), despite the README saying Next.js 14. The `frontend/AGENTS.md` file warns about breaking API changes — check `node_modules/next/dist/docs/` before writing framework-specific code.
