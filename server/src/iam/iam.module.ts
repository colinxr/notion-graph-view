import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Controllers
import { UserController } from './interfaces/http/controllers/user.controller';

// Services
import { ClerkService } from './infrastructure/clerk/clerk.service';
import { UserService } from './application/services/user.service';

// Guards
import { AuthGuard } from './interfaces/http/guards/auth.guard';
import { SubscriptionGuard } from './interfaces/http/guards/subscription.guard';
import { ClerkAuthGuard } from './interfaces/http/guards/clerk-auth.guard';

// Infrastructure
import { IAMMongoModule } from './infrastructure/persistence/mongodb/mongo.module';
import { EventBusModule } from '../shared/infrastructure/event-bus/event-bus.module';

// Clerk

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
    ClerkService,
    
    // Guards
    ClerkAuthGuard,
    SubscriptionGuard,
    ClerkAuthGuard,
  ],
  exports: [
    UserService,
    ClerkService,
    ClerkAuthGuard,
    SubscriptionGuard,
    JwtModule,
  ],
})
export class IAMModule {} 