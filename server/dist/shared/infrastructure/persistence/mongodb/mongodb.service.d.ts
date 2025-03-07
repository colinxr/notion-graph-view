import { OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { Connection } from 'mongoose';
export declare class MongoDBService implements OnApplicationBootstrap, OnApplicationShutdown {
    private readonly connection;
    constructor(connection: Connection);
    onApplicationBootstrap(): Promise<void>;
    onApplicationShutdown(): Promise<void>;
    getConnection(): Connection;
}
