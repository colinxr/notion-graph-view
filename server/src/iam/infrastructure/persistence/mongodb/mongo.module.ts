import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel, UserSchema } from './schemas/user.schema';
import { MongoUserRepository } from './mongo-user.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserModel.name, schema: UserSchema },
    ]),
  ],
  providers: [
    MongoUserRepository,
    {
      provide: 'IUserRepository',
      useClass: MongoUserRepository,
    },
  ],
  exports: ['IUserRepository'],
})
export class IAMMongoModule {} 