import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { JwtModule } from '@nestjs/jwt';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Infrastructure
import { GraphMongoModule } from './infrastructure/persistence/mongodb/mongo.module';

// Domain layer
import { GraphSchema, NodeDocument, EdgeDocument, NodeSchema, EdgeSchema } from './infrastructure/persistence/mongodb/graph.schema';
import { GraphMapper } from './infrastructure/persistence/mongodb/graph.mapper';
import { MongoGraphRepository } from './infrastructure/persistence/mongodb/graph.repository';

// Application Services
import { GraphService } from './application/services/graph.service';
import { GraphGeneratorService } from './application/services/graph-generator.service';
import { GraphSharingService } from './application/services/graph-sharing.service';

// Interface layer
import { GraphController } from './interfaces/http/controllers/graph.controller';
import { SharingController } from './interfaces/http/controllers/sharing.controller';

// External dependencies (we'll mock these with providers for now)
import { EventBusModule } from '../shared/infrastructure/event-bus/event-bus.module';
import { NotionModule } from '../notion/notion.module';
// Guards
import { AuthGuard } from '../iam/interfaces/http/guards/auth.guard';
import { SubscriptionGuard } from '../iam/interfaces/http/guards/subscription.guard';


@Module({
  imports: [
    GraphMongoModule,
    EventBusModule,
    NotionModule,
    EventEmitterModule.forRoot(),
    MongooseModule.forFeature([
      { name: 'Node', schema: NodeSchema },
      { name: 'Edge', schema: EdgeSchema },
    ]),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    GraphController,
    SharingController,
  ],
  providers: [
    // Domain layer
    GraphMapper,
    {
      provide: 'IGraphRepository',
      useClass: MongoGraphRepository,
    },
    
    // Application layer
    GraphService,
    GraphGeneratorService,
    GraphSharingService,
    
    // External Dependencies
    {
      provide: 'IEventPublisher',
      useFactory: () => ({
        publish: (event: any) => {
          // This is a simplified implementation
          console.log('Event published:', event);
        },
      }),
    },
    {
      provide: 'IUserService',
      useFactory: () => ({
        findById: async (id: string) => {
          // This is a simplified implementation
          return { id, name: `User ${id}`, email: `user${id}@example.com` };
        },
        findByIds: async (ids: string[]) => {
          // This is a simplified implementation
          return ids.map(id => ({ id, name: `User ${id}`, email: `user${id}@example.com` }));
        },
      }),
    },
  ],
  exports: [
    GraphService,
    GraphGeneratorService,
    GraphSharingService,
    GraphMongoModule,
    GraphMapper,
    'IGraphRepository',
  ],
})
export class GraphModule {} 