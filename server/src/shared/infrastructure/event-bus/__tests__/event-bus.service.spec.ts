import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { ModuleRef } from '@nestjs/core';
import { EventBusService } from '../event-bus.service';
import { LoggerService } from '../../logging/logger.service';
import {
  TestEvent,
  AnotherTestEvent,
  TestEventHandler,
  AnotherTestEventHandler,
  DifferentEventHandler,
  ErrorThrowingHandler,
} from './mocks';

describe('EventBusService', () => {
  let service: EventBusService;
  let moduleRef: ModuleRef;
  let mockLogger: LoggerService;

  beforeEach(async () => {
    mockLogger = {
      debug: jest.fn(),
      error: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
      verbose: jest.fn()
    } as LoggerService;

    const mockModuleRef = {
      create: jest.fn().mockImplementation(HandlerClass => {
        if (HandlerClass === ErrorThrowingHandler) {
          return new ErrorThrowingHandler();
        }
        return new HandlerClass();
      }),
      get: jest.fn(),
      resolve: jest.fn(),
      registerRequestByContextId: jest.fn(),
      introspect: jest.fn(),
      registerRequestById: jest.fn(),
      container: {},
      injector: {},
      _instanceLinksHost: {},
      instanceLinksHost: {},
    } as unknown as ModuleRef;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: EventBusService,
          useFactory: () => new EventBusService(mockModuleRef, mockLogger),
        },
        {
          provide: ModuleRef,
          useValue: mockModuleRef,
        },
        {
          provide: LoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<EventBusService>(EventBusService);
    moduleRef = mockModuleRef;

    // Reset all handler call trackers
    TestEventHandler.reset();
    AnotherTestEventHandler.reset();
    DifferentEventHandler.reset();
  });

  describe('register', () => {
    it('should register an event handler', () => {
      service.register(TestEventHandler);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Registered event handler TestEventHandler')
      );
    });

    it('should throw error when registering handler without metadata', () => {
      class InvalidHandler {}
      expect(() => service.register(InvalidHandler as any)).toThrow(
        'Event handler InvalidHandler is missing metadata'
      );
    });

    it('should register multiple handlers for the same event', () => {
      service.register(TestEventHandler);
      service.register(AnotherTestEventHandler);
      expect(mockLogger.debug).toHaveBeenCalledTimes(2);
    });
  });

  describe('publish', () => {
    beforeEach(() => {
      // Setup mock handler creation
      (moduleRef.create as jest.Mock).mockImplementation(async (HandlerClass) => {
        return new HandlerClass();
      });
    });

    it('should publish event to registered handlers', async () => {
      service.register(TestEventHandler);
      const event = new TestEvent('test data');
      await service.publish(event);

      expect(TestEventHandler.handleCalls).toHaveLength(1);
      expect(TestEventHandler.handleCalls[0]).toBe(event);
    });

    it('should publish event to multiple handlers', async () => {
      service.register(TestEventHandler);
      service.register(AnotherTestEventHandler);
      const event = new TestEvent('test data');
      await service.publish(event);

      expect(TestEventHandler.handleCalls).toHaveLength(1);
      expect(AnotherTestEventHandler.handleCalls).toHaveLength(1);
    });

    it('should handle errors in event handlers', async () => {
      service.register(ErrorThrowingHandler);
      const event = new TestEvent('test data');
      await service.publish(event);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error handling event TestEvent'),
        expect.any(String)
      );
    });

    it('should not call handlers for different events', async () => {
      service.register(TestEventHandler);
      service.register(DifferentEventHandler);
      const event = new AnotherTestEvent(42);
      await service.publish(event);

      expect(TestEventHandler.handleCalls).toHaveLength(0);
      expect(DifferentEventHandler.handleCalls).toHaveLength(1);
    });
  });

  describe('publishAll', () => {
    it('should publish multiple events', async () => {
      service.register(TestEventHandler);
      service.register(DifferentEventHandler);

      const events = [
        new TestEvent('test1'),
        new TestEvent('test2'),
        new AnotherTestEvent(42),
      ];

      await service.publishAll(events);

      expect(TestEventHandler.handleCalls).toHaveLength(2);
      expect(DifferentEventHandler.handleCalls).toHaveLength(1);
    });
  });
}); 