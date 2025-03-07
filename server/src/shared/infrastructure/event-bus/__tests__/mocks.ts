import 'reflect-metadata';
import { IDomainEvent } from '../../../kernel/interfaces/domain-event.interface';
import { IEventHandler } from '../interfaces/event-handler.interface';
import { EventHandler } from '../decorators/event-handler.decorator';

// Mock Events
export class TestEvent implements IDomainEvent {
  eventName = 'TestEvent';
  occurredOn = new Date();
  constructor(public readonly data: string) {}
}

export class AnotherTestEvent implements IDomainEvent {
  eventName = 'AnotherTestEvent';
  occurredOn = new Date();
  constructor(public readonly data: number) {}
}

// Mock Handlers
@EventHandler('TestEvent')
export class TestEventHandler implements IEventHandler<TestEvent> {
  static handleCalls: TestEvent[] = [];

  async handle(event: TestEvent): Promise<void> {
    TestEventHandler.handleCalls.push(event);
  }

  static reset(): void {
    this.handleCalls = [];
  }
}

@EventHandler('TestEvent')
export class AnotherTestEventHandler implements IEventHandler<TestEvent> {
  static handleCalls: TestEvent[] = [];

  async handle(event: TestEvent): Promise<void> {
    AnotherTestEventHandler.handleCalls.push(event);
  }

  static reset(): void {
    this.handleCalls = [];
  }
}

@EventHandler('AnotherTestEvent')
export class DifferentEventHandler implements IEventHandler<AnotherTestEvent> {
  static handleCalls: AnotherTestEvent[] = [];

  async handle(event: AnotherTestEvent): Promise<void> {
    DifferentEventHandler.handleCalls.push(event);
  }

  static reset(): void {
    this.handleCalls = [];
  }
}

// Mock Handler that throws an error
@EventHandler('TestEvent')
export class ErrorThrowingHandler implements IEventHandler<TestEvent> {
  async handle(event: TestEvent): Promise<void> {
    throw new Error('Test error');
  }
} 