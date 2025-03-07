import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Controllers
import { AuthController } from './interfaces/http/controllers/auth.controller';
import { UserController } from './interfaces/http/controllers/user.controller';

// Services
import { AuthService } from './application/services/auth.service';
import { UserService } from './application/services/user.service';

// Guards
import { AuthGuard } from './interfaces/http/guards/auth.guard';
import { SubscriptionGuard } from './interfaces/http/guards/subscription.guard';

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
    AuthController,
    UserController,
  ],
  providers: [
    // Services
    AuthService,
    UserService,
    
    // Guards
    AuthGuard,
    SubscriptionGuard,
  ],
  exports: [
    AuthService,
    UserService,
    AuthGuard,
    SubscriptionGuard,
  ],
})
export class IAMModule {} 