<!-- 33adfee6-3e5b-4a13-acaa-e58d40217687 -->
---
todos:
  - id: "directory-structure"
    content: "Create tests/llm-quality/ directory skeleton with subfolders"
    status: pending
  - id: "gitignore-artifacts"
    content: "Add tests/llm-quality/artifacts/ to .gitignore"
    status: pending
  - id: "playwright-config"
    content: "Create playwright.config.ts with AI-appropriate settings"
    status: pending
  - id: "dockerfile"
    content: "Create Dockerfile with version ARGs for Elementor/Angie"
    status: pending
  - id: "github-workflow"
    content: "Create llm-quality.yml workflow with skeleton jobs"
    status: pending
isProject: false
---
# LLM Quality Test Infrastructure - Phase 1: Foundation

## Scope

Foundation setup for the hybrid Playwright + promptfoo LLM quality testing system. No business logic or types - just infrastructure scaffolding.

## 1. Directory Structure

Create `tests/llm-quality/` with empty placeholder structure:

```
tests/llm-quality/
├── playwright.config.ts
├── scenarios/
│   ├── simple/
│   ├── medium/
│   ├── complex/
│   └── edge-cases/
├── runner/
├── fixtures/
├── promptfoo/
│   └── rubrics/
├── docker/
│   └── Dockerfile
└── artifacts/              # gitignored
```

Add `tests/llm-quality/artifacts/` to `.gitignore`.

## 2. Playwright Config

Create `tests/llm-quality/playwright.config.ts`:

- Separate from main `tests/playwright/playwright.config.ts`
- Longer timeouts (AI responses are slow)
- Test directory: `./scenarios`
- Single worker (sequential execution for AI interactions)
- Artifact output to `./artifacts`
- Reuse environment variables pattern from main config

Reference: `tests/playwright/playwright.config.ts` (lines 1-59)

## 3. Dockerfile

Create `tests/llm-quality/docker/Dockerfile`:

- Base: WordPress + PHP image (leverage existing blueprint patterns)
- Build ARGs:
  - `ELEMENTOR_VERSION` (default: latest)
  - `ANGIE_VERSION` (default: latest)
- Install:
  - Node.js 20.x
  - Playwright browsers
  - promptfoo (npm)
- Working directory setup for test execution

Reference existing patterns in `tests/playwright/blueprints/` for WordPress setup.

## 4. GitHub Actions Workflow

Create `.github/workflows/llm-quality.yml`:

- **Triggers**: 
  - `workflow_dispatch` (manual with version inputs)
  - `schedule` (nightly cron)
- **Inputs**:
  - `elementor_version` (default: latest)
  - `angie_version` (default: latest)
- **Jobs**:
  1. `build-env`: Docker build with version ARGs
  2. `run-scenarios`: Placeholder (Phase 2)
  3. `evaluate`: Placeholder (Phase 4)
- **Artifacts**: Upload `tests/llm-quality/artifacts/`

Reference: `.github/workflows/playwright.yml` for patterns.

## Key Files to Reference

- `tests/playwright/playwright.config.ts` - Config patterns
- `tests/playwright/parallelTest.ts` - Fixture patterns (for Phase 2)
- `tests/playwright/blueprints/ci.json` - WordPress blueprint
- `.github/workflows/playwright.yml` - CI workflow patterns

## Success Criteria

- Directory structure exists
- Playwright config loads without errors
- Dockerfile builds successfully
- GitHub workflow passes syntax validation
