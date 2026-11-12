# HomeBase

HomeBase helps homeowners track property maintenance, so they always know what has been done and what is due next.

## Team Members

- Sina McBraun
- Samuel Awe
- Tucker Little

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- ESLint and Prettier

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open http://localhost:3000 in your browser

## Team Workflow

- The `main` branch is protected. No direct pushes.
- Create a feature branch for each task using `feature/task-name` (for example, `feature/user-auth`).
- Open a pull request to merge into `main`. At least one teammate must review and approve it.

## Code Quality

- Keep TypeScript strict mode enabled and do not use the explicit `any` type.
- Use Next.js App Router conventions, with Server Components by default and
  Client Components only where browser interaction requires them.
- Prefer Tailwind utility classes; use custom CSS only when utilities are not
  an appropriate fit.
- Use PascalCase for React components, camelCase for hooks and functions, and
  lowercase kebab-case for route segments. Follow framework conventions where
  they require a different filename.
- Run `npm run lint`, `npx tsc --noEmit`, and `npx prettier --check <changed files>`
  before requesting review. Add and run automated tests for behavior changes.

There is not yet a test runner or test script in `package.json`. Feature plans
must identify an appropriate test approach, and the team must select and
configure a runner before relying on automated feature-test coverage.

## Team Notes

- Week 03 branch practice by Sina
