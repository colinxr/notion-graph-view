import { Module } from '@nestjs/common';
import { EventBusService } from './event-bus.service';
import { LoggerService } from '../logging/logger.service';

@Module({
  providers: [
    EventBusService,
    LoggerService
  ],
  exports: [
    EventBusService
  ],
})
export class EventBusModule {} 