import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { GraphMongoModule } from './infrastructure/persistence/mongodb/mongo.module';

// We'll add controllers and services later when implementing the infrastructure and application layers

@Module({
  imports: [
    ConfigModule,
    JwtModule,
    GraphMongoModule,
  ],
  controllers: [
    // We'll add controllers later when implementing the interfaces layer
  ],
  providers: [
    // We'll add application services later
  ],
  exports: [
    // We'll export necessary services later
    GraphMongoModule,
  ],
})
export class GraphModule {} 