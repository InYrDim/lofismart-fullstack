# 🤖 AI Agent Orchestration — Lofish Mart

This folder is the **single source of truth** for every AI agent (Gemini, Claude, Copilot, Cursor, etc.) that works on this fullstack project.

---

## 📂 Folder Structure

```
.agents/
│
├── README.md                  ← You are here. Start here always.
│
├── agents/                    ← Individual agent role definitions
│   ├── orchestrator.md        ← Master coordinator agent
│   ├── backend-engineer.md    ← Node.js / Express / TypeORM agent
│   ├── frontend-engineer.md   ← React / TypeScript / TailwindCSS agent
│   ├── db-engineer.md         ← MySQL / TypeORM schema & migration agent
│   ├── api-docs-engineer.md   ← OpenAPI / openapi.yaml maintenance agent
│   ├── tester.md              ← Test writer & verifier agent
│   └── reviewer.md            ← Code review & quality guard agent
│
├── workflows/                 ← Orchestrated multi-step task workflows
│   ├── new-feature.md         ← Full-stack feature delivery workflow
│   ├── bug-fix.md             ← Bug investigation & fix workflow
│   ├── db-migration.md        ← Schema change workflow
│   └── code-review.md         ← PR review & merge-ready checklist
│
├── context/                   ← Shared knowledge injected into every agent
│   ├── project-overview.md    ← What this project is
│   ├── tech-stack.md          ← Exact libraries, versions, patterns
│   ├── conventions.md         ← Coding rules (TypeScript, routing, API)
│   └── constraints.md         ← Hard rules the agent MUST never break
│
└── tasks/                     ← Active & completed task logs
    ├── _template.md           ← Copy this to start a new task
    ├── active/                ← Tasks currently in progress
    └── done/                  ← Completed task archives
```

---

## 🚀 How to Use This System

### 1. Starting a new task
```
1. Copy tasks/_template.md → tasks/active/<YYYY-MM-DD>-<slug>.md
2. Fill in the Goal, Scope, and Agent assignments.
3. Give the task file to your AI agent as the FIRST file to read.
```

### 2. Running an agent
When prompting any AI agent, always start with:
```
1. Read the following files in order before doing anything:
   1. .agents/README.md
   2. .agents/context/project-overview.md
   3. .agents/context/tech-stack.md
   4. .agents/context/conventions.md
   5. .agents/context/constraints.md
   6. .agents/agents/<role>.md
   7. .agents/tasks/active/<task-file>.md
```

### 3. Running a workflow
For multi-step tasks (e.g., a full new feature):
```
1. Read .agents/workflows/new-feature.md and execute each step sequentially.
2. Assign steps to the appropriate agent role as defined in that file.
```

---

## 🧠 Agent Role Summary

| Agent | Responsibility |
|-------|---------------|
| `orchestrator` | Breaks down tasks, assigns steps, validates completeness |
| `backend-engineer` | Routes, controllers, middleware, services (Node/Express) |
| `frontend-engineer` | React components, hooks, routing, API calls |
| `db-engineer` | Migrations, seeders, schema validation |
| `api-docs-engineer` | Maintains `openapi.yaml` in sync with backend routes |
| `tester` | Writes & runs tests, verifies correctness |
| `reviewer` | Final quality gate before any code is merged |

---

## 📋 Ground Rules

1. **Agents never modify context files** — those are read-only references.
2. **Every task gets a task file** — no undocumented work.
3. **An agent's output is always documented** — update the task file with results.
4. **The `constraints.md` is non-negotiable** — agents cannot override hard constraints.

---

## 📖 Examples

### Example Task File: `tasks/active/2026-05-01-user-auth.md`

```markdown
# 🔐 User Authentication Feature

## Goal
Implement user registration, login, and logout functionality with JWT tokens.

## Scope
- Backend: Auth routes, controllers, services, JWT middleware
- Frontend: Login/register forms, auth context, protected routes
- Database: User table with secure password storage
- Testing: Unit and integration tests for auth flows

## Assigned Agents
- orchestrator: Break down tasks, assign steps
- backend-engineer: Implement auth APIs and middleware
- frontend-engineer: Create auth UI components and context
- db-engineer: Design user schema and migration
- tester: Write test cases for auth flows
- reviewer: Final quality check before merge

## Steps
1. [ ] Database: Create user schema and migration (db-engineer)
2. [ ] Backend: Implement user registration endpoint (backend-engineer)
3. [ ] Backend: Implement login endpoint with JWT (backend-engineer)
4. [ ] Frontend: Create login/register forms (frontend-engineer)
5. [ ] Frontend: Implement auth context and protected routes (frontend-engineer)
6. [ ] Testing: Write unit tests for auth services (tester)
7. [ ] Testing: Write integration tests for auth flows (tester)
8. [ ] Review: Code review and quality check (reviewer)

## Definition of Done
- All endpoints tested and working
- UI flows complete and responsive
- Security best practices implemented (password hashing, HTTP-only cookies)
- Test coverage > 80% for auth-related code
- No critical or high severity issues in review
```

### Example Workflow: `.agents/workflows/bug-fix.md`

```markdown
# 🐛 Bug Investigation & Fix Workflow

## Purpose
Standardized process for investigating, fixing, and verifying bugs.

## Steps
1. **Reproduce** (orchestrator/tester)
   - Create failing test case that demonstrates the bug
   - Document steps to reproduce

2. **Investigate** (backend-engineer/frontend-engineer/db-engineer as appropriate)
   - Identify root cause using logs, debugging, or code inspection
   - Update task file with findings

3. **Fix** (appropriate engineer)
   - Implement minimal fix to resolve the issue
   - Ensure fix doesn't break existing functionality

4. **Verify** (tester)
   - Run existing test suite to ensure no regressions
   - Verify the failing test now passes
   - Test edge cases related to the fix

5. **Review** (reviewer)
   - Conduct code review focusing on the fix and surrounding code
   - Ensure adherence to conventions and constraints

6. **Document** (orchestrator)
   - Update task file with resolution summary
   - Move task to done/ directory
```

---

## 🛠️ Best Practices

### For Agents
- Always read the required context files before starting work
- Make small, incremental changes rather than large sweeping modifications
- Ask for clarification if task requirements are unclear
- Reference existing code patterns in the codebase
- Leave the code cleaner than you found it (boy scout rule)

### For Task Management
- Update task files regularly as work progresses
- Use clear, descriptive commit messages that reference the task
- Move completed tasks to the done/ directory with a summary
- Tag tasks with relevant labels (e.g., `frontend`, `backend`, `urgent`)

### For Workflows
- Follow workflow steps sequentially unless otherwise specified
- Don't skip verification steps even if confident in the fix
- Use workflows as checklists, not rigid procedures — adapt as needed
- Update workflows based on lessons learned from completed tasks

---

## 🔧 Troubleshooting

### Common Issues
- **"Agent keeps modifying context files"**: Remind agents that context files are read-only references only
- **"Task file not being updated"**: Ensure agents understand they must document their work in the task file
- **"Workflow steps being skipped"**: Review the workflow definition and ensure proper agent assignment
- **"Confusion about responsibilities"**: Refer to the Agent Role Summary table

### Getting Help
- Check the `.agents/context/` directory for detailed specifications
- Look at existing task files in `tasks/active/` and `tasks/done/` for examples
- When in doubt, start with the orchestrator agent for clarification