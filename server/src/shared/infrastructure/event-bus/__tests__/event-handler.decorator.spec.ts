
import { EVENT_HANDLER_METADATA, EventHandler } from '../decorators/event-handler.decorator';
import { TestEventHandler } from './mocks';

describe('EventHandler Decorator', () => {
  it('should set metadata on the class', () => {
    const metadata = Reflect.getMetadata(EVENT_HANDLER_METADATA, TestEventHandler);
    expect(metadata).toBeDefined();
    expect(metadata.eventName).toBe('TestEvent');
  });

  it('should set correct event name in metadata', () => {
    @EventHandler('CustomEvent')
    class CustomHandler {}

    const metadata = Reflect.getMetadata(EVENT_HANDLER_METADATA, CustomHandler);
    expect(metadata.eventName).toBe('CustomEvent');
  });
}); 