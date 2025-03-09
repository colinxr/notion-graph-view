import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphDocument, GraphSchema } from './graph.schema';
import { MongoGraphRepository } from './graph.repository';
import { GraphMapper } from './graph.mapper';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GraphDocument.name, schema: GraphSchema },
    ]),
  ],
  providers: [
    GraphMapper,
    {
      provide: 'IGraphRepository',
      useClass: MongoGraphRepository,
    },
  ],
  exports: [
    'IGraphRepository',
    GraphMapper,
  ],
})
export class GraphMongoModule {} 