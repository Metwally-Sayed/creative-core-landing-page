<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent Guidelines for Hello Monday Site 2

## Build, Lint, and Test Commands

All commands run from the `nextjs-app/` directory.

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies before any build/task |
| `npm run dev` | Start Next.js 16 dev server with webpack (no Turbopack) |
| `npm run build` | Run `next build` for production |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint with next/core-web-vitals and TypeScript rules |
| `npm run payload` | Start Payload CMS server (PostgreSQL) |
| `npm run payload:generate:importmap` | Regenerate admin importMap |
| `npm run payload:generate:types` | Export TypeScript bindings for Payload |
| `npm run payload:seed:projects` | Seed projects from project-catalog.ts |
| `npm run payload:seed:globals` | Seed globals (siteSettings, quoteForm, homepage) |

**Running a single test**: No test framework is currently configured. Add Vitest or Jest if tests are needed.

## Code Style Guidelines

### General Principles
- Strict mode is enabled in TypeScript (`tsconfig.json`)
- Use ESNext module resolution with bundler mode
- Enable ESLint on save and before commits

### Imports
```typescript
// Use path aliases (@/*) defined in tsconfig.json
import { Component } from '@/components/path';
import { utility } from '@/lib/utils';
// React imports (React 19)
import { useState, useEffect } from 'react';
```

### Naming Conventions
- **Components**: PascalCase (e.g., `Hero.tsx`, `ProjectDetailView.tsx`)
- **Files (non-components)**: camelCase (e.g., `project-catalog.ts`, `utils.ts`)
- **Hooks**: prefix with `use` (e.g., `useReducedMotion.ts`)
- **Utilities**: camelCase, descriptive (e.g., `cn()`, `getProjectDetail()`)
- **Types/Interfaces**: PascalCase, suffix with `Type` or use descriptive names (e.g., `ProjectDetail`, `ProjectSummary`)

### TypeScript
- All components should be typed with explicit props interfaces
- Use strict null checking (enabled by default)
- Avoid `any`; use `unknown` when type is truly unknown
- Use `zod` for runtime validation (already in dependencies)

### React/Next.js Patterns
- Server Components by default; add `'use client'` only when needed
- Use `next/link` for internal navigation
- Extract client-side logic into custom hooks
- Use `framer-motion` for animations (follow reduced-motion preferences)

### CSS and Styling
- Use Tailwind 4 with CSS variables in `globals.css`
- Use `cn()` utility from `@/lib/utils` (clsx + tailwind-merge)
- Avoid inline styles; use Tailwind classes or CSS modules
- Follow design tokens defined in `globals.css`

### Error Handling
- Use `notFound()` from `next/navigation` for 404s
- Wrap async server actions with try/catch
- Log errors appropriately (avoid exposing sensitive data)
- Use error boundaries for client components

### Component Structure
```typescript
// Preferred pattern
import { useState } from 'react';

interface Props {
  title: string;
  onAction?: () => void;
}

export function Component({ title, onAction }: Props) {
  const [state, setState] = useState(false);

  return (
    <div className="...">
      {title}
    </div>
  );
}
```

### Payload CMS Guidelines
- Collections defined in `src/collections/`
- Globals defined in `src/globals/`
- Use generated types from `src/payload-types.ts`
- Seed scripts use `.mts` extension with experimental strip types

### Accessibility
- Use semantic HTML elements
- Follow ARIA patterns (Radix UI components handle this)
- Test with keyboard navigation
- Respect `prefers-reduced-motion` via `useReducedMotion`

### File Organization
```
src/
├── app/           # Next.js App Router pages
├── components/    # React components (ui/, sections/, etc.)
├── hooks/         # Custom React hooks
├── lib/           # Utilities, catalogs, CMS helpers
├── payload/       # Payload config and types
└── styles/        # Global CSS and design tokens
```

## Key Project References

- **Layout**: `src/app/layout.tsx` (fonts, Lenis scroll, Header/Footer)
- **Catalogs**: `src/lib/project-catalog.ts`, `work-catalog.ts`, `services-catalog.ts`
- **CMS Helpers**: `src/lib/cms-projects.ts`, `cms-homepage.ts`
- **Payload Config**: `payload.config.ts`
- **Shared UI**: Components in `src/components/ui/` (built on Radix UI)

## Important Notes

- Next.js 16 with breaking changes — check `node_modules/next/dist/docs/` when uncertain
- Database must be reachable before admin UI loads (`src/lib/payload-db-health.ts`)
- Projects are statically generated; add new projects to catalog, not CMS
- QuoteBriefDialog is shared across header, product, and FAQ sections
- Use `src/lib/project_content_requirements.md.resolved` as contract for project data

Keep this file updated as the project evolves.