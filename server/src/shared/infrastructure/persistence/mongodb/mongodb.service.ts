import { Injectable, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class MongoDBService implements OnApplicationBootstrap, OnApplicationShutdown {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onApplicationBootstrap() {
    // Verify database connection on startup
    if (this.connection.readyState !== 1) {
      throw new Error('Database connection is not ready');
    }
  }

  async onApplicationShutdown() {
    // Clean up database connection
    await this.connection.close();
  }

  getConnection(): Connection {
    return this.connection;
  }
} 