# Project Rules

## Frontend

You are an expert in TypeScript, Node.js, Next.js App Router, React, Shadcn UI, Radix UI and Tailwind.

Code Style and Structure

- Write concise, technical TypeScript code with accurate examples.
- Use functional and declarative programming patterns; avoid classes.
- Prefer iteration and modularization over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
- Structure files: exported component, subcomponents, helpers, static content, types.

Naming Conventions

- Use lowercase with dashes for directories (e.g., components/auth-wizard).
- Favor named exports for components.

TypeScript Usage

- Use TypeScript for all code; prefer interfaces over types.
- Avoid enums; use maps instead.
- Use functional components with TypeScript interfaces.

Syntax and Formatting

- Use the "function" keyword for pure functions.
- Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.
- Use declarative JSX.

UI and Styling

- Use Shadcn UI, Radix, and Tailwind for components and styling.
- Implement responsive design with Tailwind CSS; use a mobile-first approach.

Performance Optimization

- Minimize 'use client', 'useEffect', and 'setState'; favor React Server Components (RSC).
- Wrap client components in Suspense with fallback.
- Use dynamic loading for non-critical components.
- Optimize images: use WebP format, include size data, implement lazy loading.

Key Conventions

- Use 'nuqs' for URL search parameter state management.
- Optimize Web Vitals (LCP, CLS, FID).
- Limit 'use client':
  - Favor server components and Next.js SSR.
  - Use only for Web API access in small components.
  - Avoid for data fetching or state management.

Follow Next.js docs for Data Fetching, Rendering, and Routing.

## Backend

You are an expert in TypeScript, NestJS, MongoDB, and queue management systems like RabbitMQ or Kafka. Emphasize a deep understanding of the business domain and its complexities.
Code Style and Structure

- Domain Layer:
  - Define domain models, entities, value objects, and domain services. Ensure that business logic resides here.
- Application Layer:
  - Implement application services that coordinate tasks and delegate work to the domain layer. This layer should be thin and devoid of business logic.
- Infrastructure Layer:
  - Handle technical concerns such as database access, messaging, and external APIs. Use repositories for data access.
  - User Interface Layer: If applicable, manage API endpoints and user interactions.
- Naming Conventions
  - Use domain-specific language for naming entities, services, and modules.
  - Use lowercase with dashes for directories (e.g., domain/user).

TypeScript Usage

- Use TypeScript interfaces and classes to define domain models and value objects.
- Ensure immutability in value objects and encapsulation in entities.

Domain Modeling

- Entities: Define entities with unique identifiers and encapsulate business logic.
- Value Objects: Use value objects to represent concepts with no identity but with equality based on attributes.
- Aggregates: Group related entities and value objects into aggregates with a single root entity.
- Domain Events: Implement domain events to capture and react to significant changes in the domain.

Syntax and Formatting

- Use NestJS decorators for dependency injection and routing.
- Maintain clear separation between domain logic and technical concerns.

Database and Queue Management

- Use repositories to abstract database interactions and maintain aggregate integrity.
- Implement event sourcing and CQRS (Command Query Responsibility Segregation) if applicable.

Performance Optimization

- Optimize database queries and use indexes effectively.
- Implement caching strategies where applicable (e.g., Redis).

Key Conventions

- Use environment variables for configuration management.
- Follow NestJS best practices for module organization and dependency injection.
- Implement logging and error handling using NestJS middleware and interceptors.
- Ensure security best practices, including input validation and sanitization.

Documentation and Testing

- Document APIs using Swagger or similar tools.
- Write unit and integration tests for critical components.
- Use CI/CD pipelines for automated testing and deployment.
  Domain-Driven Design Practices
- Collaborate closely with domain experts to refine models and terminology.
- Use bounded contexts to define clear boundaries within the domain.
- Implement anti-corruption layers to manage interactions between bounded contexts.

## Testing Requirements

- every step should be unit and feature tested

## Documentation Guidelines

- after every step, update the documentation

## Git Workflow

- follow git flow
