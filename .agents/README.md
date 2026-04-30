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
Read the following files in order before doing anything:
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
Read .agents/workflows/new-feature.md and execute each step sequentially.
Assign steps to the appropriate agent role as defined in that file.
```

---

## 🧠 Agent Role Summary

| Agent | Responsibility |
|-------|---------------|
| `orchestrator` | Breaks down tasks, assigns steps, validates completeness |
| `backend-engineer` | Routes, controllers, middleware, services (Node/Express) |
| `frontend-engineer` | React components, hooks, routing, API calls |
| `db-engineer` | Migrations, seeders, schema validation |
| `tester` | Writes & runs tests, verifies correctness |
| `reviewer` | Final quality gate before any code is merged |

---

## 📋 Ground Rules

1. **Agents never modify context files** — those are read-only references.
2. **Every task gets a task file** — no undocumented work.
3. **An agent's output is always documented** — update the task file with results.
4. **The `constraints.md` is non-negotiable** — agents cannot override hard constraints.
