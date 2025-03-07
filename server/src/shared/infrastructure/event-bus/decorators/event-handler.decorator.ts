import { SetMetadata } from '@nestjs/common';

export const EVENT_HANDLER_METADATA = 'event_handler_metadata';

export const EventHandler = (eventName: string): ClassDecorator => {
  return SetMetadata(EVENT_HANDLER_METADATA, { eventName });
}; 