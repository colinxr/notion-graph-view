
import { Injectable, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { IDomainEvent } from '../../kernel/interfaces/domain-event.interface';
import { IEventHandler, EventHandlerMetadata } from './interfaces/event-handler.interface';
import { EVENT_HANDLER_METADATA } from './decorators/event-handler.decorator';
import { LoggerService } from '../logging/logger.service';

@Injectable()
export class EventBusService {
  private readonly handlers: Map<string, Type<IEventHandler<IDomainEvent>>[]> = new Map();

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly logger: LoggerService,
  ) {}

  register(handler: Type<IEventHandler<IDomainEvent>>): void {
    const metadata = Reflect.getMetadata(EVENT_HANDLER_METADATA, handler) as EventHandlerMetadata;
    
    if (!metadata) {
      throw new Error(`Event handler ${handler.name} is missing metadata`);
    }

    const { eventName } = metadata;
    const handlers = this.handlers.get(eventName) || [];
    handlers.push(handler);
    this.handlers.set(eventName, handlers);

    this.logger.debug(`Registered event handler ${handler.name} for event ${eventName}`);
  }

  async publish(event: IDomainEvent): Promise<void> {
    const eventName = event.eventName;
    const handlers = this.handlers.get(eventName) || [];

    this.logger.debug(`Publishing event ${eventName} to ${handlers.length} handlers`);

    for (const HandlerClass of handlers) {
      try {
        const handler = await this.moduleRef.create(HandlerClass);
        await handler.handle(event);
      } catch (error) {
        this.logger.error(
          `Error handling event ${eventName} in handler ${HandlerClass.name}`,
          error instanceof Error ? error.stack : undefined
        );
      }
    }
  }

  async publishAll(events: IDomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }
} 