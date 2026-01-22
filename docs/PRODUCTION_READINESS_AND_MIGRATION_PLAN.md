# Oxygen Production Readiness & Technology Migration Plan

## Executive Summary

**Current Production Readiness: 25% - NOT PRODUCTION READY**

| Category | Current Score | Target Score |
|----------|---------------|--------------|
| Security | 2/10 | 8/10 |
| Error Handling | 3/10 | 8/10 |
| Testing | 0/10 | 8/10 |
| Performance | 5/10 | 8/10 |
| Code Quality | 5/10 | 8/10 |
| DevOps/CI-CD | 2/10 | 8/10 |
| Observability | 1/10 | 8/10 |

---

## Part 1: Current Technology Stack Analysis

### Current Stack

| Layer | Technology | Version | Issues |
|-------|------------|---------|--------|
| **Build** | Create React App | 5.0.1 | Slow builds, no config, stuck in 2022 |
| **Language** | TypeScript | 4.6.3 | 4 years old, mixed JS/TS codebase |
| **Frontend** | React | 18.0.0 | Acceptable |
| **State** | React Query + Redux + Context | 3.38.0 / varies | Fragmented, 3 systems |
| **Styling** | styled-components + SCSS + Bootstrap | 5.3.5 / 5.2.0-beta1 | 3 systems, beta in prod |
| **Backend** | Firebase (Firestore) | 9.9.2 | No security rules, N+1 queries |
| **Forms** | Formik + Yup | 2.2.9 | Outdated, mixing with custom |
| **Tables** | react-table + @tanstack/react-table | 7.7.0 + 8.9.1 | DUPLICATE libraries |
| **Gantt** | gantt-task-react + @wamra/gantt-task-react | 0.3.8 + 0.6.3 | DUPLICATE libraries |
| **Date** | Moment.js | 2.30.1 | 67KB, deprecated |
| **Icons** | 4 libraries | varies | Excessive redundancy |
| **Testing** | Jest (unused) | - | 0% coverage |

### Critical Problems Identified

1. **Security Vulnerabilities**
   - XSS via `dangerouslySetInnerHTML` without sanitization
   - Missing Firestore security rules
   - Email used as API token
   - No authorization checks in services
   - Auth tokens in localStorage (XSS vulnerable)

2. **Architecture Issues**
   - N+1 query patterns (15+ locations)
   - Async forEach anti-pattern (fire-and-forget)
   - Prop drilling 3+ levels deep
   - Over-burdened Context (15+ state values)
   - Multiple sources of truth for data

3. **Bundle Bloat**
   - ~150-200KB of duplicate/unused libraries
   - 4 icon font libraries
   - ES5 target shipping excess polyfills
   - Only 2/50+ routes lazy-loaded

4. **Developer Experience**
   - No CI/CD pipeline
   - No pre-commit hooks
   - 165 console.log statements
   - Zero test coverage

---

## Part 2: Recommended Technology Stack

### Target Architecture (2026 Modern Stack)

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│  Build: Vite 6.x          │  Language: TypeScript 5.7+          │
│  UI: React 19 + Shadcn/UI │  Styling: Tailwind CSS 4.x          │
│  Forms: React Hook Form   │  Validation: Zod                    │
│  State: Zustand + TanStack Query v5                             │
│  DnD: @dnd-kit/core       │  Tables: TanStack Table v8          │
├─────────────────────────────────────────────────────────────────┤
│                          DATA LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  Firebase 11.x (Firestore + Auth + Storage)                     │
│  + Firestore Security Rules (mandatory)                         │
│  + Optional: Supabase for PostgreSQL migration path             │
├─────────────────────────────────────────────────────────────────┤
│                      QUALITY & DEVOPS                            │
├─────────────────────────────────────────────────────────────────┤
│  Testing: Vitest + React Testing Library + Playwright           │
│  CI/CD: GitHub Actions                                          │
│  Error Tracking: Sentry                                         │
│  Linting: ESLint 9 + Prettier 3 + Husky                        │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Decisions Rationale

#### Build Tool: Vite 6.x (replacing CRA)
- **Why**: 10x faster dev startup, 4x faster builds, native ESM
- **Migration effort**: Low (1-2 days)
- **Bundle savings**: ~5-10% (modern browser target)

#### State Management: Zustand + TanStack Query v5
- **Why**: Replaces fragmented Redux + Context + react-query
- **Benefits**:
  - Zustand: 1KB, simple API, no boilerplate
  - TanStack Query v5: Modern caching, optimistic updates, devtools
- **Migration effort**: Medium (1-2 weeks)

#### Styling: Tailwind CSS 4.x (replacing styled-components + SCSS)
- **Why**: Utility-first, consistent design tokens, smaller bundle
- **Benefits**:
  - No runtime CSS-in-JS overhead
  - Built-in dark mode
  - Design system consistency
- **Migration effort**: High (3-4 weeks) but can be incremental

#### UI Components: Shadcn/UI + Radix Primitives
- **Why**: Accessible by default, customizable, no vendor lock-in
- **Benefits**:
  - WCAG 2.1 AA compliant
  - Copy-paste ownership (not npm dependency)
  - Radix primitives for complex interactions
- **Migration effort**: Medium (2-3 weeks)

#### Forms: React Hook Form + Zod
- **Why**: Better performance than Formik, modern validation
- **Benefits**:
  - Uncontrolled inputs = fewer re-renders
  - Zod for type-safe validation
  - 50% less code than Formik
- **Migration effort**: Medium (1-2 weeks)

#### Testing: Vitest + Playwright
- **Why**: Vite-native testing, fast, modern
- **Benefits**:
  - Same config as Vite
  - Playwright for E2E (cross-browser)
  - Visual regression testing
- **Migration effort**: Medium (2-3 weeks to reach 70% coverage)

#### Drag & Drop: @dnd-kit/core (replacing react-beautiful-dnd)
- **Why**: react-beautiful-dnd is deprecated/unmaintained
- **Benefits**:
  - Active maintenance
  - Better accessibility
  - Smaller bundle
- **Migration effort**: Medium (1 week)

#### Date Handling: date-fns (replacing Moment.js)
- **Why**: Tree-shakeable, smaller bundle
- **Benefits**: 67KB → ~10KB (85% reduction)
- **Migration effort**: Low (2-3 days)

---

## Part 3: Migration Plan (Agent-Ready Tasks)

The following plan is divided into **Phases** and **Sprints**, with each task sized for a single agent session.

---

### Phase 1: Critical Security Fixes (Week 1)
**Priority: BLOCKING - Must complete before any production deployment**

#### Sprint 1.1: Security Hardening

**Task 1.1.1: Add DOMPurify for XSS Prevention**
```
Agent Prompt:
Install DOMPurify and sanitize all dangerouslySetInnerHTML usage.

Files to modify:
- src/components/common/TextEditedContent/index.jsx
- src/utils/browser.js
- Any other files using dangerouslySetInnerHTML

Steps:
1. Run: npm install dompurify @types/dompurify
2. Create utility: src/utils/sanitize.ts with sanitizeHtml function
3. Replace all dangerouslySetInnerHTML with sanitized version
4. Add unit tests for sanitization
5. Commit with message: "security: add DOMPurify to prevent XSS attacks"
```

**Task 1.1.2: Create Firestore Security Rules**
```
Agent Prompt:
Create comprehensive Firestore security rules to enforce authorization.

Files to create:
- firestore.rules
- firebase.json (if not exists)

Requirements:
1. Users can only read/write their organization's data
2. Validate user membership before any operation
3. Protect admin-only operations
4. Add rules for: organisation, users, items, sprints, goals, workpackages
5. Test rules using Firebase Emulator
6. Commit with message: "security: add Firestore security rules"
```

**Task 1.1.3: Fix Authentication Token System**
```
Agent Prompt:
Replace email-based API token with proper Firebase ID token.

Files to modify:
- src/modules/auth/core/_requests.ts
- src/modules/auth/core/AuthHelpers.ts
- src/modules/auth/core/Auth.tsx

Steps:
1. Use Firebase getIdToken() instead of email
2. Store token securely (consider httpOnly cookie via Cloud Function)
3. Add token refresh logic
4. Add token expiration checking
5. Remove console.log of user data
6. Commit with message: "security: implement proper Firebase ID token auth"
```

**Task 1.1.4: Add Authorization Service Layer**
```
Agent Prompt:
Create authorization checks for all service operations.

Files to create:
- src/services/authorizationService.ts

Files to modify:
- src/services/itemServices.js
- src/services/workspaceServices.js
- src/services/sprintServices.js

Steps:
1. Create canUserAccessOrg(userId, orgId) function
2. Create canUserModifyItem(userId, itemId) function
3. Add authorization checks before all CRUD operations
4. Throw AuthorizationError for unauthorized access
5. Commit with message: "security: add authorization checks to services"
```

---

### Phase 2: Critical Bug Fixes (Week 1-2)

#### Sprint 2.1: Data Integrity Fixes

**Task 2.1.1: Fix Async forEach Anti-Pattern**
```
Agent Prompt:
Fix all async forEach patterns that cause fire-and-forget bugs.

Files with issues (15+ locations):
- src/services/firestore.js (lines 231, 253, 289, 343)
- src/services/itemServices.js
- src/services/sprintServices.js

Pattern to find: querySnapshot.forEach(async

Replace with:
await Promise.all(querySnapshot.docs.map(async (doc) => {...}))

Or use for...of loop:
for (const doc of querySnapshot.docs) { await ... }

Commit with message: "fix: replace async forEach with proper await patterns"
```

**Task 2.1.2: Add Error Handlers to All Mutations**
```
Agent Prompt:
Add onError handlers to all React Query mutations.

Files to search: src/services/*.js

Find all useMutation calls and add:
- onError callback with toast notification
- Error logging to console.error
- Optional: Sentry error reporting

Create error handling utility:
- src/utils/errorHandling.ts

Commit with message: "fix: add error handlers to all mutations"
```

**Task 2.1.3: Fix useEffect Dependency Arrays**
```
Agent Prompt:
Audit and fix all useEffect hooks with missing dependencies.

Files to check:
- src/modules/Workspace/index.jsx (line 61 - missing mergeFilters)
- src/modules/IssueDetails/index.jsx
- All files in src/modules/

Use ESLint exhaustive-deps rule to find issues.
Fix or add eslint-disable with explanation for intentional omissions.

Commit with message: "fix: correct useEffect dependency arrays"
```

---

### Phase 3: Build System Modernization (Week 2)

#### Sprint 3.1: Migrate to Vite

**Task 3.1.1: Initialize Vite Configuration**
```
Agent Prompt:
Migrate from Create React App to Vite.

Steps:
1. Install: npm install -D vite @vitejs/plugin-react
2. Create vite.config.ts with:
   - React plugin
   - Path aliases matching current tsconfig
   - Environment variable handling (VITE_ prefix)
3. Update index.html (move to root, add script module)
4. Update package.json scripts
5. Remove react-scripts dependency
6. Test development server

Commit with message: "build: migrate from CRA to Vite"
```

**Task 3.1.2: Update TypeScript Configuration**
```
Agent Prompt:
Modernize TypeScript configuration for Vite.

Files to modify:
- tsconfig.json
- Create tsconfig.node.json for Vite config

Changes:
1. Update target to ES2022
2. Update module to ESNext
3. Add moduleResolution: bundler
4. Enable noUncheckedIndexedAccess
5. Update to TypeScript 5.7+

Commit with message: "build: modernize TypeScript configuration"
```

**Task 3.1.3: Configure Vitest for Testing**
```
Agent Prompt:
Set up Vitest as the test runner.

Steps:
1. Install: npm install -D vitest @vitest/coverage-v8 jsdom
2. Add vitest config to vite.config.ts
3. Update test script in package.json
4. Create setup file for React Testing Library
5. Add coverage thresholds (start at 0, increase over time)
6. Verify existing test infrastructure works

Commit with message: "build: configure Vitest for testing"
```

---

### Phase 4: Dependency Cleanup (Week 2-3)

#### Sprint 4.1: Remove Duplicates

**Task 4.1.1: Consolidate Table Libraries**
```
Agent Prompt:
Remove react-table v7, keep only @tanstack/react-table v8.

Files using react-table:
- Search for: import.*from.*react-table

Steps:
1. Find all react-table v7 imports
2. Migrate to @tanstack/react-table v8 API
3. Update GenericList component
4. Remove react-table from package.json
5. Remove @types/react-table

Commit with message: "refactor: consolidate to TanStack Table v8"
```

**Task 4.1.2: Consolidate Gantt Libraries**
```
Agent Prompt:
Remove gantt-task-react, keep only @wamra/gantt-task-react.

Files to check:
- src/modules/Workspace/Roadmap/

Steps:
1. Identify which library is actually used
2. Migrate any usage to @wamra version
3. Remove unused library from package.json
4. Test Gantt/Roadmap functionality

Commit with message: "refactor: consolidate Gantt libraries"
```

**Task 4.1.3: Remove Unused Dependencies**
```
Agent Prompt:
Remove unused dependencies from package.json.

Dependencies to investigate and remove if unused:
- @emotion/react, @emotion/styled (0 imports found)
- react-redux-firebase, redux-firestore (minimal usage)
- yarn (should not be a dependency)

Steps:
1. Search codebase for imports from each library
2. Remove confirmed unused dependencies
3. Run npm install to update lockfile
4. Test application still works

Commit with message: "chore: remove unused dependencies"
```

**Task 4.1.4: Replace Moment.js with date-fns**
```
Agent Prompt:
Replace Moment.js with date-fns for 85% bundle reduction.

Files using moment:
- src/components/common/DatePicker/
- src/modules/Workspace/Calendar/
- src/modules/Workspace/Roadmap/
- Any file with: import moment

Steps:
1. Install: npm install date-fns
2. Create migration utility mapping moment functions to date-fns
3. Replace moment imports file by file
4. Remove moment from package.json
5. Test all date functionality

Commit with message: "refactor: replace Moment.js with date-fns"
```

**Task 4.1.5: Consolidate Icon Libraries**
```
Agent Prompt:
Consolidate 4 icon libraries into 1 (Lucide React recommended).

Current libraries:
- @fortawesome/fontawesome-free
- bootstrap-icons
- line-awesome
- socicon

Steps:
1. Install: npm install lucide-react
2. Create icon mapping utility
3. Replace icon usage file by file (prioritize common icons)
4. Remove unused icon libraries
5. Verify all icons display correctly

Commit with message: "refactor: consolidate to Lucide icons"
```

---

### Phase 5: State Management Modernization (Week 3-4)

#### Sprint 5.1: Implement Zustand

**Task 5.1.1: Create Zustand Store Structure**
```
Agent Prompt:
Set up Zustand stores to replace Redux and heavy Context usage.

Files to create:
- src/stores/authStore.ts
- src/stores/workspaceStore.ts
- src/stores/uiStore.ts

Steps:
1. Install: npm install zustand
2. Create authStore with user state
3. Create workspaceStore with project, filters, config
4. Create uiStore with theme, sidebar state
5. Add TypeScript types for all stores
6. Add devtools middleware

Commit with message: "feat: implement Zustand store structure"
```

**Task 5.1.2: Migrate WorkspaceProvider to Zustand**
```
Agent Prompt:
Replace WorkspaceProvider Context with Zustand workspaceStore.

Files to modify:
- src/contexts/WorkspaceProvider.jsx → convert to Zustand
- All files importing useWorkspace

Steps:
1. Move state from WorkspaceProvider to workspaceStore
2. Create useWorkspace hook that uses Zustand
3. Update all consumers to use new hook
4. Remove old WorkspaceProvider
5. Test workspace functionality

Commit with message: "refactor: migrate WorkspaceProvider to Zustand"
```

**Task 5.1.3: Migrate to TanStack Query v5**
```
Agent Prompt:
Upgrade from react-query v3 to @tanstack/react-query v5.

Files to modify:
- All files in src/services/
- src/App.tsx (QueryClientProvider)

Steps:
1. Install: npm install @tanstack/react-query @tanstack/react-query-devtools
2. Remove react-query package
3. Update imports throughout codebase
4. Update API changes (useQuery options syntax changed)
5. Add QueryDevtools to App.tsx
6. Test all data fetching

Commit with message: "refactor: upgrade to TanStack Query v5"
```

**Task 5.1.4: Remove Redux**
```
Agent Prompt:
Remove Redux and related packages (minimally used).

Files to modify:
- src/redux/ (delete directory)
- src/App.tsx (remove Provider)
- src/modules/Goals/ (migrate OKR slice to Zustand)

Steps:
1. Migrate OKR state to Zustand store
2. Update Goals module to use Zustand
3. Remove Redux Provider from App
4. Delete src/redux directory
5. Remove @reduxjs/toolkit, react-redux-firebase, redux-firestore, redux-thunk

Commit with message: "refactor: remove Redux in favor of Zustand"
```

---

### Phase 6: UI Component Library Migration (Week 4-6)

#### Sprint 6.1: Set Up Shadcn/UI + Tailwind

**Task 6.1.1: Initialize Tailwind CSS**
```
Agent Prompt:
Set up Tailwind CSS alongside existing styles for gradual migration.

Steps:
1. Install: npm install -D tailwindcss postcss autoprefixer
2. Run: npx tailwindcss init -p
3. Configure tailwind.config.js with content paths
4. Add Tailwind directives to src/styles/tailwind.css
5. Import in App.tsx
6. Map existing CSS variables to Tailwind theme
7. Test Tailwind classes work

Commit with message: "build: initialize Tailwind CSS"
```

**Task 6.1.2: Initialize Shadcn/UI**
```
Agent Prompt:
Set up Shadcn/UI component library.

Steps:
1. Run: npx shadcn@latest init
2. Configure components.json
3. Set up path aliases in tsconfig
4. Add first component: npx shadcn@latest add button
5. Create src/components/ui/ directory structure
6. Test Button component renders

Commit with message: "build: initialize Shadcn/UI"
```

**Task 6.1.3: Migrate Button Component**
```
Agent Prompt:
Replace custom Button with Shadcn Button.

Files to modify:
- src/components/common/Button/ (deprecate)
- All files importing Button from common

Steps:
1. Add Shadcn button: npx shadcn@latest add button
2. Map existing variants to Shadcn variants
3. Create adapter if needed for iconOnly prop
4. Replace imports file by file
5. Remove old Button component
6. Test all button usages

Commit with message: "refactor: migrate Button to Shadcn/UI"
```

**Task 6.1.4: Migrate Modal Component**
```
Agent Prompt:
Replace custom Modal with Shadcn Dialog.

Files to modify:
- src/components/common/Modal/
- All files using Modal

Steps:
1. Add: npx shadcn@latest add dialog
2. Create Modal adapter using Dialog primitives
3. Match existing Modal API
4. Replace imports gradually
5. Test all modal usages

Commit with message: "refactor: migrate Modal to Shadcn Dialog"
```

**Task 6.1.5: Migrate Select Component**
```
Agent Prompt:
Replace custom Select with Shadcn Select.

Files to modify:
- src/components/common/Select/
- All files using Select

Steps:
1. Add: npx shadcn@latest add select
2. Handle multi-select (may need Combobox)
3. Preserve keyboard navigation
4. Replace imports
5. Test all select usages

Commit with message: "refactor: migrate Select to Shadcn/UI"
```

**Task 6.1.6: Migrate Form Components**
```
Agent Prompt:
Replace Formik with React Hook Form + Zod.

Files to modify:
- src/components/common/Form/
- src/modules/auth/components/

Steps:
1. Install: npm install react-hook-form @hookform/resolvers zod
2. Add Shadcn form: npx shadcn@latest add form input label
3. Convert login form first
4. Convert registration form
5. Create reusable form patterns
6. Remove Formik/Yup when fully migrated

Commit with message: "refactor: migrate forms to React Hook Form + Zod"
```

---

### Phase 7: Performance Optimization (Week 5-6)

#### Sprint 7.1: Code Splitting & Lazy Loading

**Task 7.1.1: Implement Route-Based Code Splitting**
```
Agent Prompt:
Add lazy loading to all major routes.

Files to modify:
- src/routing/PrivateRoutes.tsx
- src/routing/AppRoutes.tsx

Routes to lazy load:
- Workspace (Board, Backlog, Sprints, Timeline, Calendar)
- Goals
- IssueDetails
- Admin
- Account

Steps:
1. Convert imports to React.lazy()
2. Wrap routes with Suspense
3. Create route-specific loading skeletons
4. Verify bundle splitting with analyzer

Commit with message: "perf: implement route-based code splitting"
```

**Task 7.1.2: Add Virtual Scrolling to Lists**
```
Agent Prompt:
Implement virtual scrolling for large lists.

Files to modify:
- src/modules/Workspace/Backlog/
- src/modules/Workspace/Board/
- src/components/common/List/GenericList.jsx

Steps:
1. Install: npm install @tanstack/react-virtual
2. Implement virtualization in Backlog list
3. Implement in Board columns if many items
4. Test with 1000+ items
5. Verify memory usage improvement

Commit with message: "perf: add virtual scrolling to large lists"
```

**Task 7.1.3: Add Memoization to Expensive Components**
```
Agent Prompt:
Add React.memo, useMemo, useCallback to performance-critical components.

Files to prioritize:
- src/modules/IssueDetails/index.jsx
- src/modules/Workspace/Board/
- src/modules/Workspace/Backlog/
- All list item components

Steps:
1. Identify components that re-render frequently (React DevTools)
2. Add React.memo to list items
3. Add useMemo for expensive calculations
4. Add useCallback for event handlers passed as props
5. Verify with React Profiler

Commit with message: "perf: add memoization to performance-critical components"
```

---

### Phase 8: Testing Infrastructure (Week 6-7)

#### Sprint 8.1: Unit Testing Foundation

**Task 8.1.1: Set Up Testing Infrastructure**
```
Agent Prompt:
Configure comprehensive testing setup.

Files to create:
- src/test/setup.ts
- src/test/utils.tsx (custom render with providers)
- src/test/mocks/firebase.ts

Steps:
1. Configure Vitest with jsdom
2. Set up React Testing Library
3. Create mock for Firebase
4. Create custom render with all providers
5. Add test scripts to package.json
6. Verify setup with sample test

Commit with message: "test: set up testing infrastructure"
```

**Task 8.1.2: Add Auth Service Tests**
```
Agent Prompt:
Write tests for authentication services.

Files to create:
- src/modules/auth/__tests__/auth.test.ts

Test cases:
- Login with valid credentials
- Login with invalid credentials
- Registration flow
- Password reset
- Token refresh
- Logout

Target: 80% coverage on auth module

Commit with message: "test: add authentication service tests"
```

**Task 8.1.3: Add Item Service Tests**
```
Agent Prompt:
Write tests for item/issue services.

Files to create:
- src/services/__tests__/itemServices.test.ts

Test cases:
- getItems returns filtered items
- createItem adds to Firestore
- updateItem modifies correct document
- deleteItem removes and handles cleanup
- Error handling for invalid inputs

Target: 80% coverage on itemServices

Commit with message: "test: add item service tests"
```

**Task 8.1.4: Add Component Tests**
```
Agent Prompt:
Write tests for critical UI components.

Files to create:
- src/components/common/__tests__/Button.test.tsx
- src/components/common/__tests__/Modal.test.tsx
- src/components/common/__tests__/Select.test.tsx

Test cases:
- Renders correctly with different props
- Handles user interactions
- Accessibility (keyboard navigation)
- Edge cases (empty state, loading)

Commit with message: "test: add component unit tests"
```

#### Sprint 8.2: Integration & E2E Testing

**Task 8.2.1: Set Up Playwright E2E**
```
Agent Prompt:
Configure Playwright for end-to-end testing.

Steps:
1. Install: npm install -D @playwright/test
2. Run: npx playwright install
3. Create playwright.config.ts
4. Create e2e/ directory structure
5. Add E2E test scripts to package.json
6. Create first smoke test (app loads)

Commit with message: "test: set up Playwright E2E testing"
```

**Task 8.2.2: Add Critical Path E2E Tests**
```
Agent Prompt:
Write E2E tests for critical user journeys.

Files to create:
- e2e/auth.spec.ts (login/logout flow)
- e2e/workspace.spec.ts (create workspace, view board)
- e2e/issue.spec.ts (create, edit, delete issue)

Test flows:
1. User can log in and see dashboard
2. User can create a workspace
3. User can create an issue
4. User can drag issue on board
5. User can edit issue details

Commit with message: "test: add critical path E2E tests"
```

---

### Phase 9: DevOps & CI/CD (Week 7-8)

#### Sprint 9.1: GitHub Actions Pipeline

**Task 9.1.1: Create CI Pipeline**
```
Agent Prompt:
Set up GitHub Actions CI pipeline.

Files to create:
- .github/workflows/ci.yml

Pipeline steps:
1. Install dependencies (npm ci)
2. Type check (tsc --noEmit)
3. Lint (npm run lint)
4. Unit tests (npm test)
5. Build (npm run build)
6. Upload coverage to Codecov

Triggers: push to main, all PRs

Commit with message: "ci: add GitHub Actions CI pipeline"
```

**Task 9.1.2: Add Pre-commit Hooks**
```
Agent Prompt:
Set up Husky and lint-staged for pre-commit validation.

Steps:
1. Install: npm install -D husky lint-staged
2. Run: npx husky init
3. Configure lint-staged in package.json
4. Add pre-commit hook for lint-staged
5. Add pre-push hook for tests

Lint-staged config:
- *.{ts,tsx}: eslint --fix, prettier --write
- *.{json,md}: prettier --write

Commit with message: "ci: add pre-commit hooks with Husky"
```

**Task 9.1.3: Add Security Scanning**
```
Agent Prompt:
Add automated security scanning to CI.

Files to modify:
- .github/workflows/ci.yml

Add steps:
1. npm audit (dependency vulnerabilities)
2. CodeQL analysis (code security)
3. Fail on high/critical vulnerabilities

Create:
- .github/workflows/codeql.yml

Commit with message: "ci: add security scanning to pipeline"
```

---

### Phase 10: Observability (Week 8)

#### Sprint 10.1: Error Tracking & Monitoring

**Task 10.1.1: Integrate Sentry**
```
Agent Prompt:
Add Sentry for error tracking and performance monitoring.

Steps:
1. Install: npm install @sentry/react
2. Initialize Sentry in src/index.tsx
3. Configure environment (dsn from env var)
4. Add ErrorBoundary with Sentry reporting
5. Add performance monitoring
6. Test error reporting

Commit with message: "feat: integrate Sentry error tracking"
```

**Task 10.1.2: Add App-Level Error Boundary**
```
Agent Prompt:
Create comprehensive error boundary system.

Files to create:
- src/components/ErrorBoundary/index.tsx
- src/components/ErrorBoundary/ErrorFallback.tsx

Features:
1. Catch React render errors
2. Report to Sentry
3. Show user-friendly error UI
4. Provide retry option
5. Log error context

Wrap App with ErrorBoundary in index.tsx

Commit with message: "feat: add comprehensive error boundary"
```

**Task 10.1.3: Remove Console Statements**
```
Agent Prompt:
Remove all console.log statements from production code.

Steps:
1. Search for: console.log, console.error, console.warn
2. Remove or replace with proper logger
3. Create src/utils/logger.ts with environment-aware logging
4. Keep error logging, remove debug logging
5. Add ESLint rule to prevent future console usage

Commit with message: "chore: remove console statements, add proper logger"
```

---

### Phase 11: Documentation & Cleanup (Week 8)

#### Sprint 11.1: Final Cleanup

**Task 11.1.1: Update Documentation**
```
Agent Prompt:
Update project documentation for new stack.

Files to update:
- README.md
- CLAUDE.md
- Create .env.example

Document:
1. New technology stack
2. Updated setup instructions
3. Development workflow
4. Testing commands
5. Deployment process

Commit with message: "docs: update documentation for new stack"
```

**Task 11.1.2: Remove Old Styles**
```
Agent Prompt:
Clean up old styling system after Tailwind migration.

Files to remove (after full migration):
- src/components/*/Styles.js (styled-components)
- Unused SCSS files

Steps:
1. Verify all components use Tailwind
2. Remove styled-components package
3. Remove unused SCSS files
4. Keep only necessary global styles
5. Update imports

Commit with message: "chore: remove legacy styling system"
```

**Task 11.1.3: Final Bundle Analysis**
```
Agent Prompt:
Analyze and optimize final bundle size.

Steps:
1. Run: npm run build
2. Run bundle analyzer
3. Identify any remaining large chunks
4. Document bundle size metrics
5. Set up size limit checks in CI

Create:
- docs/BUNDLE_ANALYSIS.md with findings

Commit with message: "docs: add bundle analysis report"
```

---

## Part 4: Migration Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| **Phase 1**: Security | Week 1 | XSS fix, Firestore rules, auth tokens |
| **Phase 2**: Bug Fixes | Week 1-2 | Async fixes, error handlers |
| **Phase 3**: Build System | Week 2 | Vite migration, TypeScript update |
| **Phase 4**: Dependencies | Week 2-3 | Remove duplicates, date-fns |
| **Phase 5**: State Management | Week 3-4 | Zustand, TanStack Query v5 |
| **Phase 6**: UI Components | Week 4-6 | Shadcn/UI, Tailwind, React Hook Form |
| **Phase 7**: Performance | Week 5-6 | Code splitting, virtualization |
| **Phase 8**: Testing | Week 6-7 | 70% unit coverage, E2E tests |
| **Phase 9**: DevOps | Week 7-8 | CI/CD, pre-commit hooks |
| **Phase 10**: Observability | Week 8 | Sentry, error boundaries |
| **Phase 11**: Cleanup | Week 8 | Documentation, final optimization |

**Total Estimated Duration: 8 weeks**

---

## Part 5: Post-Migration Production Readiness

After completing all phases, expected scores:

| Category | Before | After |
|----------|--------|-------|
| Security | 2/10 | 8/10 |
| Error Handling | 3/10 | 9/10 |
| Testing | 0/10 | 8/10 |
| Performance | 5/10 | 8/10 |
| Code Quality | 5/10 | 8/10 |
| DevOps/CI-CD | 2/10 | 9/10 |
| Observability | 1/10 | 8/10 |

**Overall Production Readiness: 83% - PRODUCTION READY**

---

## Part 6: Long-Term Considerations

### Future Backend Migration (Optional)
If Firebase costs become prohibitive or features require SQL:

1. **Supabase** - PostgreSQL + Auth + Storage + Realtime
   - Similar DX to Firebase
   - Better for complex queries
   - Open source, self-hostable

2. **PlanetScale** - MySQL + Serverless
   - Better for high-scale
   - Branching workflows

### React 19 Migration
When React 19 reaches stable:
- Server Components for initial data loading
- Improved Suspense boundaries
- Actions for form handling

### Framework Migration Path
If SSR/SEO becomes important:
- Next.js 15 (React framework with SSR/SSG)
- Remix (full-stack React framework)
