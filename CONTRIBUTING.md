# Contributing to AI Tool Roadmapper

Thank you for your interest in contributing! AI Tool Roadmapper is an open-source project and we welcome contributions of all kinds — bug fixes, new features, documentation improvements, and additions to the AI tool database.

Please take a few minutes to read this guide before opening an issue or pull request. It will make the process smoother for everyone.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Ways to Contribute](#ways-to-contribute)
- [Development Setup](#development-setup)
- [Monorepo Structure](#monorepo-structure)
- [Branch Naming](#branch-naming)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Adding New Tools to the Database](#adding-new-tools-to-the-database)
- [Code Style](#code-style)

---

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating you agree to uphold a welcoming, respectful environment for everyone. Please report unacceptable behaviour to the maintainers.

---

## Ways to Contribute

| Type | How |
|---|---|
| **Report a bug** | Open a [Bug Report issue](.github/ISSUE_TEMPLATE/bug_report.md) |
| **Request a feature** | Open a [Feature Request issue](.github/ISSUE_TEMPLATE/feature_request.md) |
| **Submit an AI tool** | Open a [Tool Submission issue](.github/ISSUE_TEMPLATE/tool_submission.md) |
| **Improve documentation** | Edit files in `docs/` or update the README and open a PR |
| **Fix a bug** | Fork, branch, fix, and open a PR (see below) |
| **Build a feature** | Discuss in an issue first, then open a PR |

---

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org) 20 or later
- [pnpm](https://pnpm.io) 10 or later

  ```bash
  npm install -g pnpm
  ```

- A [Supabase](https://supabase.com) project (free tier is fine)
- An [Anthropic API key](https://console.anthropic.com)
- An [Inngest](https://inngest.com) account or the local dev server

### Step-by-step

```bash
# 1. Fork the repository on GitHub, then clone your fork
git clone https://github.com/nolanselby/stackmap.git
cd stackmap

# 2. Add the upstream remote so you can pull future changes
git remote add upstream https://github.com/nolanselby/stackmap.git

# 3. Install all workspace dependencies
pnpm install

# 4. Copy the environment variable template
cp apps/web/.env.local.example apps/web/.env.local

# 5. Fill in your Supabase and Anthropic credentials
#    See apps/web/.env.local.example for descriptions of each variable

# 6. Set up Supabase and run migrations
#    Full instructions: docs/setup-supabase.md

# 7. Start the Next.js development server
pnpm dev

# Or start all packages/services in parallel
pnpm dev:all
```

### Useful scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the Next.js app only |
| `pnpm dev:all` | Start all services via Turborepo |
| `pnpm build` | Build all packages |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Type-check all packages |
| `pnpm test` | Run all test suites |

---

## Monorepo Structure

This project uses **Turborepo** with **pnpm workspaces**. Understanding the layout will help you find the right place to make changes.

```
ai-tool-roadmapper/
├── apps/web/          Next.js application, API routes, Inngest functions
├── packages/
│   ├── db/            Drizzle ORM schema, migrations, Supabase client
│   ├── prompts/       Claude system and user prompt templates
│   ├── schemas/       Zod validation schemas shared across packages
│   └── scoring/       Tool scoring / ranking algorithms
└── services/
    ├── enrich/        Enrichment: classifies and deduplicates tools
    └── planner/       Planner: retrieves tools and generates roadmaps
```

Changes that span multiple packages are fine — Turborepo handles the build ordering. When you add or change a shared type, update it in the relevant `packages/` workspace and Turborepo will rebuild dependants automatically.

---

## Branch Naming

Please use the following prefixes for your branches:

| Prefix | Use case |
|---|---|
| `feat/` | New feature or capability |
| `fix/` | Bug fix |
| `docs/` | Documentation only changes |
| `chore/` | Build process, tooling, dependency updates |
| `refactor/` | Code restructuring without behaviour change |
| `test/` | Adding or fixing tests |

Examples:

```
feat/export-roadmap-as-pdf
fix/chat-scroll-on-mobile
docs/add-supabase-rls-guide
chore/upgrade-ai-sdk-v5
```

---

## Commit Messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). Each commit message should be structured as:

```
<type>(optional scope): <short description>

[optional body]

[optional footer(s)]
```

### Types

| Type | When to use |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only |
| `style` | Formatting, whitespace (no logic change) |
| `refactor` | Restructuring without behaviour change |
| `test` | Adding or updating tests |
| `chore` | Build scripts, dependencies, tooling |

### Examples

```
feat(planner): add cost estimation to roadmap output
fix(chat): prevent duplicate messages on fast submit
docs: add Inngest local dev instructions to CONTRIBUTING
chore(deps): upgrade @ai-sdk/* to 5.0
```

---

## Pull Request Process

1. **Open an issue first** for non-trivial changes so the approach can be discussed before you invest time coding.
2. **Keep PRs focused** — one feature or fix per PR. Large, unrelated changes are harder to review.
3. **Fill in the PR template** completely. Incomplete PRs may be closed without review.
4. **Ensure the following pass** before requesting review:
   - `pnpm typecheck` — no TypeScript errors
   - `pnpm lint` — no lint warnings or errors
   - `pnpm test` — all tests pass
5. **Request a review** from at least one maintainer.
6. **Squash and merge** is preferred for feature branches. The PR title becomes the squash commit message, so make it a valid conventional commit.

---

## Adding New Tools to the Database

The AI tool database is the core of this project. We actively welcome tool submissions!

1. **Check first** — search the existing database to make sure the tool is not already listed.
2. **Open a Tool Submission issue** using the [tool submission template](.github/ISSUE_TEMPLATE/tool_submission.md). A maintainer will review it.
3. **For bulk additions or data improvements**, add entries to the seed SQL file and run `node scripts/apply-seed.mjs`.

---

## Code Style

- **TypeScript strict mode** — `"strict": true` is set in `tsconfig.base.json`. All new code must be fully typed; avoid `any`.
- **ESLint** — configuration is inherited from the Next.js defaults. Run `pnpm lint` to check.
- **Prettier** — use the project's Prettier config (if present) or default settings. Consistent formatting is enforced in CI.
- **No default exports from packages** — internal packages use named exports for tree-shaking and explicitness.
- **Zod for runtime validation** — use the shared schemas in `packages/schemas` where applicable rather than defining inline shapes.

---

Thank you again for contributing. Every improvement, no matter how small, makes the project better for everyone.
