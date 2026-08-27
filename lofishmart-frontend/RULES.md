# Frontend Rules & Guidelines

## TypeScript Guidelines

### Strict Typing
To maintain code quality and prevent runtime errors, we enforce strict typing across the entire frontend codebase.

- **Avoid `any` Type**: You **MUST NOT** use the `any` keyword. Using `any` defeats the purpose of TypeScript, bypasses the compiler's safety checks, and leads to difficult-to-trace runtime errors.
  - **Reasoning**: `any` effectively disables type checking for that variable and any subsequent operations involving it.
  - **Requirement**: Define specific `interface` or `type` for all data structures, especially API responses and component props.
  - **Alternative**: If a type is truly dynamic or unknown at compile time, use `unknown` and perform type narrowing (using `typeof`, `instanceof`, or custom type guards) before use.

### State Management
- **Explicit State Typing**: When using `useState`, always provide the type parameter if it cannot be perfectly inferred.
  - *Correct:* `useState<StockItem[]>([])`
  - *Incorrect:* `useState<any[]>([])`

## Component Guidelines

### Structure & Clean Code
- **Props Interfaces**: Every component should have a clearly defined interface for its props.
- **Functional Components**: Use functional components with React Hooks.
- **Naming**: Use PascalCase for components and files that export components. Use camelCase for hooks and utility functions.

# Coding Rules
- Always place components in `src/components/`, then in a subfolder named after the route path (e.g., `kelolagudang` for components used in the `kelolagudang` routes).
- Do not use the `any` type. Always use proper TypeScript interfaces or types.