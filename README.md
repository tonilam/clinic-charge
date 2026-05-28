# Clinic Charge

A SaaS application to store GP clinic consultation charges

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Angular |
| Backend | Python 3.10+ |
| Database | PostgreSQL / MySQL |
| DevOps | Docker |

## Docker Setup

To run the application locally with all services (frontend, backend, database):

```bash
docker compose up --build
```

Access the application at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000

To stop and clean up:

```bash
docker compose down -v
```

## Tools

| Tool        | Purpose                                         |
| ----------- | ----------------------------------------------- |
| Claude Code | Agentic coding                                  |
| Obsidian    | Visual tool to read `.md` documentation         |
| Claudian    | An Obsidian plug-in for agentic document writer |

**Disclaimer:** This project utilised Claude Code and related AI-assisted development tools to assist with the development process and code writing. These tools helped accelerate development whilst maintaining code quality and project structure.

## MVP Development Workflow

This project follows a structured approach to deliver MVPs systematically, from requirements to deployment.

### Phase 1: Requirements & Planning
1. **Read and Clarify Requirements** — Identify ambiguous concepts (e.g., choice of backend framework, database technology).
2. **Create Documentation** — Set up a `docs/` folder and use Obsidian with the Claudian plugin to generate project documentation.
3. **Define Architecture** — Document the architecture design across frontend, backend, database, and testing layers.
4. **Estimate & Prioritise** — Define the MVP timeline, estimate tasks, and prioritise work.

### Phase 2: Implementation
1. **Switch to Claude Code** — Begin implementation with a traceable strategy using change logs and a `TRACEABILITY.md` file.
2. **Test-Driven Development** — All implementation is fully secured by automated tests.
3. **Frequent Commits** — Create git commits frequently to ensure progress is traceable and can be easily reverted if needed.

### Phase 3: Verification & Testing
1. **Verify Traceability** — Manually check the `TRACEABILITY.md` file and ensure all requirements are ticked off and implemented in the codebase.
2. **Automated Test Suite** — Run all automated tests to ensure quality.
3. **Manual Smoke Testing** — Spin up the application and test all requirements end-to-end.
4. **Bug Fixes** — Address any issues discovered during testing.

### Phase 4: Enhancement & Deployment
1. **User Experience Improvements** — Enhance the application based on usability findings.
2. **CI/CD Setup** — Create GitHub Actions to ensure all tests pass not just locally, but for other developers and in CI pipelines.
3. **Post-Launch Analysis** — Conduct an analysis of the implementation to identify potential improvements for future iterations (out of MVP scope).

This workflow ensures requirements are met, code quality is maintained, and progress is fully traceable throughout the development lifecycle.
