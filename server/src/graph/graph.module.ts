import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

// We'll add controllers and services later when implementing the infrastructure and application layers

@Module({
  imports: [
    MongooseModule.forFeature([
      // We'll add Mongoose schemas later
    ]),
    ConfigModule,
    JwtModule,
  ],
  controllers: [
    // We'll add controllers later
  ],
  providers: [
    // We'll add services, repositories, and factories later
  ],
  exports: [
    // We'll export necessary services later
  ],
})
export class GraphModule {} 