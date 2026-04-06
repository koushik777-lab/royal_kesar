# Royal Kesar Company - Luxury Kashmiri Ecommerce Platform

## Overview

Full-stack luxury ecommerce platform for Royal Kesar Company, a premium Kashmiri brand founded by Sirajuddin Bhat in Pampore. Sells authentic saffron, premium dry fruits, and handcrafted Pashmina shawls.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion
- **Routing**: Wouter
- **Auth**: JWT tokens (stored in localStorage, sent via Bearer header)

## Architecture

- `artifacts/royal-kesar/` — React + Vite frontend (served at `/`)
- `artifacts/api-server/` — Express 5 backend (served at `/api`)
- `lib/db/` — Drizzle ORM schema and database client
- `lib/api-spec/` — OpenAPI spec (source of truth)
- `lib/api-client-react/` — Generated React Query hooks
- `lib/api-zod/` — Generated Zod validation schemas

## Features

- **Home**: Cinematic hero, featured products, category highlights, testimonials
- **Products**: Catalog with category/search filtering
- **Product Detail**: Image gallery, add-to-cart, origin/weight info
- **Cart**: Slide-in drawer + dedicated page
- **Checkout**: Multi-step (address → review → confirmation)
- **Auth**: JWT login/register with glassmorphic UI
- **Account**: Order history, profile management
- **Admin**: Dashboard stats, CRUD for products/categories, order status management
- **About**: Pampore heritage story
- **Contact**: Full contact details

## Auth

- **Admin credentials**: admin@royalkesar.com / admin123
- **Customer credentials**: customer@example.com / customer123
- JWT tokens are generated server-side and stored in localStorage
- Auth token getter configured in `main.tsx` via `setAuthTokenGetter`

## Design

- Color palette: Background #0F0F0F, Gold #D4AF37, Royal Purple #5A2D82, Saffron #C1440E
- Typography: Playfair Display (headings), Poppins (body)
- Dark luxury aesthetic with glassmorphism, floating SVG animations

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
