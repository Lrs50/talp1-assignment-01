# AGENTS.md

## Project Overview
This project implements a web-based system for exam creation, randomization, and grading.

Stack:
- Frontend: React + TypeScript
- Backend: Node.js + TypeScript
- Testing: Cucumber (Gherkin)

---

## Core Philosophy

The code must prioritize:
- Simplicity over complexity
- Readability over cleverness
- Clear structure over abstraction

Code should be easy to understand at a glance.

---

## Coding Style

- Use clear and descriptive names for variables, functions, and classes
- Avoid abbreviations unless obvious
- Prefer simple solutions over "smart" ones
- Keep functions small and focused
- Avoid deep nesting
- Avoid unnecessary abstractions

---

## Structure (Top-Down Thinking)

Always follow a top-down approach:

1. Start from the high-level structure
2. Break into smaller parts
3. Implement each part clearly

Code should reflect the problem decomposition.

---

## Backend Architecture

- Use layered structure:
  - Controller (HTTP layer)
  - Service (business logic)
  - Repository (data access)

Rules:
- Do not mix responsibilities
- Controllers must be thin
- Business logic must be explicit

---

## Frontend Guidelines

- Use small, focused components
- Separate logic from UI
- Avoid complex state when possible
- Prefer clarity over optimization

---

## Documentation

- Use short and meaningful docstrings
- Explain "why", not "what"
- Avoid verbose comments

---

## Testing

- Use Gherkin for acceptance tests
- Cover main flows and edge cases
- Tests should reflect real usage

---

## Development Workflow

For every feature:

1. Understand the problem
2. Propose a simple design
3. Validate before coding
4. Implement incrementally
5. Review code quality

---

## Code Quality Checklist

Before finalizing any code, ensure:

- Is it easy to read?
- Is it simple?
- Are names clear?
- Is the structure logical?
- Would a human write it this way?

---

## Agent Behavior

- Do not generate large code without explanation
- Always explain structure before coding
- Prefer incremental steps
- Ask questions if something is unclear
- Avoid overengineering

## Skill Integration

When performing tasks, follow structured steps similar to the available skills:

- For design tasks:
  - Restate the problem
  - Define entities and structure
  - Propose a simple solution before coding

- For implementation:
  - Follow backend → frontend order
  - Keep code modular and readable

- For review:
  - Evaluate readability, simplicity, and structure
  - Suggest improvements when needed

Always align behavior with these structured workflows