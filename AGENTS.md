# AGENTS.md

## Code style
- TypeScript strict mode
- Double quotes for HTML properties, single quotes TypeScript / JavaScript
- Prefer clean and readable code over clever code
- No single-line returns, always use braces
- Prefer separated blocks of code by empty lines
- Prefer TailwindCSS over CSS modules

## Components
- Prefer functional components over class components
- Evaluate if a component should be a client component or server component. If it needs to use state, effects, or browser APIs, it should be a client component. Otherwise, it can be a server component.
- When refactoring components evaluate if they can be split into smaller components to improve readability and maintainability.
- When creating new components from a refactor of an existing component, evaluate if the component should live inside the same file or in a separate file. If the component is only used by the parent component, it can live inside the same file. If it is used by multiple components or should be visible externally, even for architectural reasons, it should live in a separate file.

## Adding entries in About page
- If you need a new SVG icon for an About entry, ask the dev running the agent for the SVG (or reuse an existing icon) before adding a new devicon component.