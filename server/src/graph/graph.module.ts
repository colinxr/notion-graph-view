import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

// Infrastructure
import { GraphMongoModule } from './infrastructure/persistence/mongodb/mongo.module';

// Application Services
import { GraphService } from './application/services/graph.service';
import { GraphGeneratorService } from './application/services/graph-generator.service';
import { GraphSharingService } from './application/services/graph-sharing.service';
import { EmbeddingService } from './application/services/embedding.service';

// External dependencies (we'll mock these with providers for now)
import { EventBusModule } from '../shared/infrastructure/event-bus/event-bus.module';
import { NotionModule } from '../notion/notion.module';

@Module({
  imports: [
    ConfigModule,
    JwtModule,
    GraphMongoModule,
    EventBusModule,
    NotionModule,
  ],
  controllers: [
    // We'll add controllers when implementing the interfaces layer
  ],
  providers: [
    GraphService,
    GraphGeneratorService,
    GraphSharingService,
    EmbeddingService,
    {
      provide: 'IEventPublisher',
      useFactory: (eventBus: any) => ({
        publish: (event: any) => eventBus.publish(event),
      }),
      inject: ['EventBus'],
    },
  ],
  exports: [
    GraphService,
    GraphGeneratorService,
    GraphSharingService,
    EmbeddingService,
    GraphMongoModule,
  ],
})
export class GraphModule {} 