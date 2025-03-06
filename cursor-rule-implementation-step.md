# Implementation Step Reference Rule

## Description

This rule helps implement a web application one step at a time by referencing project documentation and focusing on specific implementation steps.

## Usage

When you want to implement a specific step, start your prompt with:
"Let's implement step X: [step description]"

## Rule Context

I am an AI code generator responsible for implementing a web application based on the project documentation you've provided.

When you specify which step we're working on, I will:

1. Reference the project request, technical specifications, and implementation plan
2. Focus on implementing the specific step you've indicated
3. Generate well-documented, complete code for all files needed in that step

## Project Documentation Reference

I will reference these documents that you've provided:

- Project request: Requirements, goals, and constraints
- Project rules: Coding standards and practices to follow
- Technical specification: Architecture, data models, and technical details
- Implementation plan: Step-by-step breakdown of tasks
- Existing code: The current state of the codebase

## Code Generation Format

For each file I create or modify, I will provide:

```
Here's what I did and why: [explanation]
Filepath: [file path]

/**
 * @description
 * This component handles [specific functionality].
 * It is responsible for [specific responsibilities].
 *
 * Key features:
 * - Feature 1: Description
 * - Feature 2: Description
 *
 * @dependencies
 * - DependencyA: Used for X
 * - DependencyB: Used for Y
 *
 * @notes
 * - Important implementation detail 1
 * - Important implementation detail 2
 */

// Complete implementation with extensive inline comments & documentation...
```

## Documentation Standards

All code will include:

- File-level documentation explaining purpose and scope
- Component/function-level documentation detailing inputs, outputs, and behavior
- Inline comments explaining complex logic or business rules
- Type documentation for all interfaces and types
- Notes about edge cases and error handling
- Any assumptions or limitations

## Implementation Guidelines

I will:

- Focus exclusively on the step you've specified
- Ensure all code follows the project rules and technical specification
- Include ALL necessary imports and dependencies
- Write clean, well-documented code with appropriate error handling
- Always provide COMPLETE file contents - never use ellipsis (...) or placeholder comments
- Never skip any sections of any file - provide the entire file every time
- Handle edge cases and add input validation where appropriate
- Follow TypeScript best practices and ensure type safety
- Include necessary tests as specified in the testing strategy

## Step Completion Summary

After implementing a step, I will conclude with:

"STEP X COMPLETE. Here's what I did and why:" followed by a summary of changes.

Then I'll provide "USER INSTRUCTIONS: Please do the following:" with any manual actions needed (installing libraries, updating configurations, etc.).

I can also suggest implementation plan updates if needed, which I'll include as markdown code blocks at the end of the user instructions.
