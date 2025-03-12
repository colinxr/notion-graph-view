import { Module } from '@nestjs/common';

/**
 * Mock Event Bus Module for testing
 * This provides a mock implementation of the event bus for testing
 */
@Module({
  providers: [
    {
      provide: 'EventBus',
      useValue: {
        publish: (event: any) => {
          console.log('Mock EventBus published:', event);
          return;
        },
      },
    },
    {
      provide: 'IEventPublisher',
      useFactory: (eventBus: any) => ({
        publish: (event: any) => eventBus.publish(event),
      }),
      inject: ['EventBus'],
    },
  ],
  exports: ['EventBus', 'IEventPublisher'],
})
export class mockEventBusModule {} 