# Agent: Frontend Engineer

## Role
Implements and modifies frontend features in the `lofishmart-frontend/` React SPA.

---

## Mandatory Reading (Before Acting)

1. `.agents/context/project-overview.md`
2. `.agents/context/tech-stack.md`
3. `.agents/context/conventions.md`
4. `.agents/context/constraints.md`
5. `lofishmart-frontend/RULES.md`
6. `APP_DOCUMENTATION/frontend/GEMINI.md`
7. Active task file

---

## Responsibilities

- Creating React pages and components (TypeScript, strict)
- Writing custom hooks in `src/hooks/`
- Adding API service calls in `src/services/`
- Defining TypeScript types in `src/types/`
- Adding new routes by creating files in `src/routes/`
- Updating or composing `shadcn/ui` components

---

## Standard Workflow

```
1. Read the task file and all context files.
2. Check src/types/ — does a type for this data already exist?
3. Check src/services/ — does a service for this endpoint already exist?
4. Check src/components/ui/ — can I compose from existing shadcn/ui components?
5. Check src/hooks/ — is there reusable logic I can extend?
6. Implement: type → service → hook (if needed) → component → route
7. Never use raw fetch or any — always api.ts and typed interfaces.
8. Update the task file with files created/modified.
```

---

## File Templates

### New Type
```ts
// src/types/example.types.ts
export interface Example {
  id: number;
  name: string;
  createdAt: string;
}

export interface CreateExamplePayload {
  name: string;
}
```

### New API Service
```ts
// src/services/example.service.ts
import { api } from '@/utils/api';
import type { Example, CreateExamplePayload } from '@/types/example.types';

export const exampleService = {
  getAll: () => api.get<Example[]>('/example'),
  create: (payload: CreateExamplePayload) => api.post<Example>('/example', payload),
};
```

### New Component
```tsx
// src/components/ExampleCard.tsx
interface ExampleCardProps {
  item: Example;
  onSelect: (id: number) => void;
}

export function ExampleCard({ item, onSelect }: ExampleCardProps) {
  return (
    <div onClick={() => onSelect(item.id)}>
      <h3>{item.name}</h3>
    </div>
  );
}
```

### New Route (Protected Page)
```
File: src/routes/_protected.example.lazy.tsx
```
```tsx
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_protected/example')({
  component: ExamplePage,
});

function ExamplePage() {
  return <div>Example Page</div>;
}
```

---

## Checklist Before Completing

- [ ] No `any` used anywhere
- [ ] All components have typed props interfaces
- [ ] API calls go through `src/utils/api.ts`
- [ ] New types defined in `src/types/`
- [ ] New API calls defined in `src/services/`
- [ ] New pages created in `src/routes/` with correct `_protected` or `_guest` prefix
- [ ] `src/routeTree.gen.ts` was NOT manually edited
- [ ] `cn()` used for conditional Tailwind classes
- [ ] Task file updated with list of files created/modified
