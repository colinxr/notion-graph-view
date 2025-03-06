# Backend Notion Graph View Technical Specification

## 1. System Overview

### Core Purpose

- Visualize relationships between Notion pages based on backlinks.
- Provide an embeddable graph visualization for Notion users.
- Manage user authentication, data synchronization, and subscriptions.

### Key Workflows

1. **User Authentication**: OAuth authentication with Notion API.
2. **Database Import**: Retrieve Notion pages and their backlinks.
3. **Graph Generation**: Structure data into a graph format.
4. **Graph API**: Serve graph data for frontend rendering.
5. **Subscription Management**: Handle Stripe payments and access control.
6. **Background Jobs**: Process database imports and scheduled refreshes.
7. **Embedding Support**: Generate embeddable links for graphs.

### System Architecture

- **Backend**: Nest.js (Node.js framework) with TypeScript.
- **Database**: MongoDB (NoSQL for flexible schema handling).
- **Caching**: Redis for storing temporary graph data.
- **Background Processing**: BullMQ for queue management.
- **Payments**: Stripe for subscription management.
- **Monitoring**: Prometheus & Grafana for performance tracking.

## 2. Project Structure

```
/notion-graph-backend
├── src
│   ├── modules
│   │   ├── auth (OAuth logic)
│   │   ├── notion (API integration)
│   │   ├── graph (Graph processing)
│   │   ├── payments (Stripe integration)
│   │   ├── users (User management)
│   │   ├── cache (Redis layer)
│   │   ├── jobs (Background tasks)
│   ├── main.ts (Application entry point)
├── test (Unit & e2e tests)
├── scripts (Deployment scripts)
├── .env (Environment variables)
├── Dockerfile (Containerization)

```

## 3. Feature Specification

### 3.1 Authentication & Integration

- **User Story**: Users log in via Notion OAuth.
- **Implementation**:
  - Use Notion API for authentication.
  - Store refresh tokens securely.
  - Implement token expiration handling.
- **Edge Cases**:
  - Handle revoked permissions.
  - Implement retry logic for failed API requests.

### 3.2 Database Management

- **User Story**: Users select Notion databases to visualize.
- **Implementation**:
  - Fetch databases via Notion API.
  - Store database metadata in MongoDB.
  - Use background jobs to process large datasets.
- **Edge Cases**:
  - Prevent duplicate imports.
  - Graceful degradation if Notion API is down.

### 3.3 Graph Visualization API

- **User Story**: Users see a graph representation of Notion backlinks.
- **Implementation**:
  - Convert backlinks into nodes and edges.
  - Use D3.js-compatible JSON format.
  - Implement lazy loading for large graphs.
- **Edge Cases**:
  - Optimize for large, interconnected graphs.
  - Implement failover caching for quick access.

## 4. Database Schema

### 4.1 Tables

### users

| Field        | Type   | Constraints |
| ------------ | ------ | ----------- |
| id           | UUID   | Primary Key |
| email        | String | Unique      |
| notion_id    | String | Unique      |
| access_token | String | Secure      |

### databases

| Field   | Type   | Constraints |
| ------- | ------ | ----------- |
| id      | UUID   | Primary Key |
| user_id | UUID   | Foreign Key |
| name    | String |             |

### pages

| Field       | Type   | Constraints |
| ----------- | ------ | ----------- |
| id          | UUID   | Primary Key |
| database_id | UUID   | Foreign Key |
| title       | String |             |
| backlinks   | Array  |             |

## 5. Server Actions

### 5.1 Database Actions

### Fetch User Notion Databases

- **Input**: `user_id`
- **Output**: List of databases
- **Query**: Notion API `/v1/databases`

### 5.2 Other Actions

### Stripe Subscription Handling

- **Webhook Handling**: Process subscription events.
- **Data Formats**:
  ```json
  {
    "user_id": "abc123",
    "status": "active",
    "plan": "5/month"
  }
  ```

## 6. Authentication & Authorization

- OAuth 2.0 with Notion API.
- JWT for session authentication.
- Role-based access for admin features.

## 7. Data Flow

- **Data Fetching**: Background jobs handle imports.
- **State Management**: Redis caching for improved performance.
- **API Rate Limiting**: Exponential backoff for Notion API calls.

## 8. Stripe Integration

- Webhooks for subscription events.
- Monthly subscription enforcement.
- Admin dashboard for billing reports.

## 9. Analytics Implementation

- PostHog for tracking usage events.
- Metrics include active users, database syncs, and revenue.

## 10. Testing Strategy

- **Unit Tests**: Jest for API and business logic.
- **e2e Tests**: Playwright for user workflows.
- **Load Testing**: K6 for Notion API stress tests.
