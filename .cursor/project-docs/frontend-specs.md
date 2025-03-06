# Front-end Notion Graph View Frontend Technical Specification

## 1. System Overview

### Core Purpose

- Visualize relationships between Notion pages in an interactive graph.
- Provide an embeddable graph component for Notion pages.
- Manage user authentication, data fetching, and subscriptions.

### Key Workflows

1. **User Authentication**: OAuth authentication with Notion API.
2. **Database Selection**: User selects which Notion database to visualize.
3. **Graph Rendering**: Display interactive relationships between Notion pages.
4. **Embedding Support**: Provide iframe-compatible graph views.
5. **Subscription Management**: Handle payments via Stripe.
6. **Error Handling**: Provide clear UI feedback for failed API calls.

### System Architecture

- **Frontend Framework**: Next.js (React Server Components + Client Components where needed).
- **State Management**: React Query for API calls, Zustand for global state.
- **Styling**: Tailwind CSS with shadcn/ui for accessible UI components.
- **Graph Library**: D3.js for rendering node-link diagrams.
- **Authentication**: Clerk for OAuth session handling.
- **Payments**: Stripe UI components for subscriptions.

## 2. Project Structure

```
/notion-graph-frontend
├── src
│   ├── components
│   │   ├── ui (buttons, modals, forms)
│   │   ├── graph (D3 visualization components)
│   │   ├── auth (OAuth UI)
│   ├── pages
│   │   ├── index.tsx (landing page)
│   │   ├── dashboard.tsx (graph visualization)
│   │   ├── settings.tsx (user settings)
│   ├── hooks (custom React hooks)
│   ├── lib (utility functions)
│   ├── styles (Tailwind styles)
├── public (static assets)
├── .env (environment variables)
├── package.json

```

## 3. Feature Specification

### 3.1 Authentication & Integration

- **User Story**: Users log in via Notion OAuth.
- **Implementation**:
  - Redirect to Notion OAuth page.
  - Exchange authorization code for an access token.
  - Store session in Clerk.
- **Edge Cases**:
  - Handle expired or revoked tokens.
  - Provide UI feedback for failed authentication.

### 3.2 Graph Visualization

- **User Story**: Users view Notion page connections in an interactive graph.
- **Implementation**:
  - Fetch backlink data from API.
  - Render graph using D3.js.
  - Provide zoom, drag, and highlight interactions.
- **Edge Cases**:
  - Optimize rendering for large graphs.
  - Handle missing or incomplete data.

### 3.3 Embedding Support

- **User Story**: Users embed the graph in Notion pages.
- **Implementation**:
  - Provide iframe embed link.
  - Support interactive controls within the iframe.
- **Edge Cases**:
  - Ensure compatibility with different Notion layouts.

### 3.4 Subscription Management

- **User Story**: Users subscribe to the service via Stripe.
- **Implementation**:
  - Use Stripe Elements for checkout.
  - Display current plan and allow cancellations.
- **Edge Cases**:
  - Handle failed payments.
  - Provide UI feedback for billing issues.

## 4. Data Flow & State Management

- **Data Fetching**: Use React Query to manage API calls.
- **Local Storage**: Store user preferences (theme, layout).
- **Real-time Updates**: Use polling or WebSockets for live changes.

## 5. Authentication Implementation

- Clerk handles OAuth sessions.
- Middleware ensures protected routes require authentication.
- JWT-based authentication for API requests.

## 6. Design System

### 6.1 Visual Style

- **Color Palette**:
  - Light Mode: `#ffffff`, `#1e1e1e`, `#3b82f6`
  - Dark Mode: `#18181b`, `#f9fafb`, `#60a5fa`
- **Typography**:
  - Font: Inter, sans-serif
  - Sizes: `sm`, `md`, `lg`

### 6.2 Core Components

- **Navigation Bar** (dashboard links, authentication status).
- **Graph View** (interactive node-link visualization).
- **Settings Panel** (theme toggle, database selection).
- **Subscription UI** (Stripe integration).

## 7. Component Architecture

### 7.1 Server Components

- Handle API fetching and preloading.
- Suspense boundaries for async data.

### 7.2 Client Components

- Graph interactions (click, zoom, drag events).
- Subscription flow using Stripe Elements.
- State management with Zustand.

## 8. Payment Implementation

- **Stripe UI**: Hosted checkout flow.
- **Webhook Handling**: Sync subscription status.
- **Product Tiers**: Flat `$5/month` subscription.

## 9. Analytics Implementation

- **Event Tracking**:
  - Graph interactions.
  - Subscription conversions.
  - Time spent exploring graphs.

## 10. Testing Strategy

- **Unit Tests**: Jest + Testing Library for component testing.
- **e2e Tests**: Playwright for full user flows.
- **Performance Tests**: Optimize D3.js rendering.

## 11. Error Handling & Reliability

- **UI Notifications**: Toast messages for errors.
- **Retry Logic**: Automatic retries for API failures.
- **Fallback UI**: Display cached data if API fails.
