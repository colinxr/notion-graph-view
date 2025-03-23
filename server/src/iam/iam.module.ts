import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Controllers
import { UserController } from './interfaces/http/controllers/user.controller';

// Services
import { UserService } from './application/services/user.service';

// Guards
import { SubscriptionGuard } from './interfaces/http/guards/subscription.guard';

// Middleware
import { ClerkMiddleware } from './interfaces/http/middleware/clerk.middleware';

// Infrastructure
import { IAMMongoModule } from './infrastructure/persistence/mongodb/mongo.module';
import { EventBusModule } from '../shared/infrastructure/event-bus/event-bus.module';

@Module({
  imports: [
    // Configure JWT with environment variables
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
    IAMMongoModule,
    EventBusModule,
  ],
  controllers: [
    UserController,
  ],
  providers: [
    // Services
    UserService,
    
    // Guards
    SubscriptionGuard,
  ],
  exports: [
    UserService,
    SubscriptionGuard,
    JwtModule,
  ],
})
export class IAMModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ClerkMiddleware)
      .forRoutes(
        { path: 'users/clerk/*', method: RequestMethod.ALL },
        { path: 'notion/*', method: RequestMethod.ALL }
      );
  }
} 