# Notion Graph View - Backend

## Development Setup

### Prerequisites

- Node.js (v18+)
- Docker Desktop (with Apple Silicon support)
- npm/yarn

### Docker Infrastructure

The project uses Docker Compose to run the following services:

```bash
# Start all services
npm run docker:up

# Stop all services
npm run docker:down

# View logs
npm run docker:logs

# Clean up (including volumes)
npm run docker:clean
```

#### Services

1. **MongoDB**

   - Port: 27017
   - Credentials:
     - Username: admin
     - Password: password
   - Connection URI: `mongodb://admin:password@localhost:27017/notion-graph?authSource=admin`

2. **Mongo Express (MongoDB UI)**

   - URL: http://localhost:8081
   - Credentials:
     - Username: admin
     - Password: password
   - Features:
     - Browse/search collections
     - Create/edit documents
     - Import/export data
     - Database statistics

3. **Redis**

   - Port: 6380 (changed from default 6379 to avoid conflicts)
   - No authentication required (development setup)

4. **RedisInsight (Redis UI)**
   - URL: http://localhost:8082
   - First-time setup:
     1. Open http://localhost:8082
     2. Add Redis Database:
        - Host: redis
        - Port: 6379
        - Name: notion-graph-redis
   - Features:
     - Browser-based GUI for Redis
     - Real-time monitoring
     - Data visualization
     - Command-line interface
     - Memory analysis

### Environment Variables

The `.env` file contains all necessary configuration. Key variables:

```env
# MongoDB
MONGODB_URI=mongodb://admin:password@localhost:27017/notion-graph?authSource=admin

# Redis
REDIS_HOST=localhost
REDIS_PORT=6380

# Admin Interfaces
MONGO_EXPRESS_URL=http://localhost:8081
REDIS_INSIGHT_URL=http://localhost:8082
```

### Development Workflow

1. Start the infrastructure:

   ```bash
   npm run docker:up
   ```

2. Verify services:

   - MongoDB UI: http://localhost:8081
   - Redis UI: http://localhost:8082

3. Start the application:
   ```bash
   npm run start:dev
   ```

### Troubleshooting

1. **Docker Services**

   ```bash
   # Check service status
   docker ps

   # View service logs
   npm run docker:logs

   # Restart services
   npm run docker:down && npm run docker:up
   ```

2. **Data Persistence**

   - Data is persisted in Docker volumes
   - Clean up with: `npm run docker:clean`
   - Volumes:
     - `mongodb_data`: MongoDB data
     - `redis_data`: Redis data
     - `redis_insight_data`: RedisInsight settings and data

3. **Common Issues**
   - If Redis fails to start, check if port 6380 is in use
   - For ARM64 (Apple Silicon) users, all images are configured for arm64 platform
   - To completely reset: `npm run docker:clean && npm run docker:up`
   - When connecting RedisInsight to Redis, use the container name 'redis' as the host
