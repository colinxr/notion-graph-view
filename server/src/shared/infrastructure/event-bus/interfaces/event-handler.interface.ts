import { IDomainEvent } from '../../../kernel/interfaces/domain-event.interface';

export interface IEventHandler<T extends IDomainEvent> {
  handle(event: T): Promise<void>;
}

export interface EventHandlerMetadata {
  eventName: string;
} 