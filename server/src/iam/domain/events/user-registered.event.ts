import { IDomainEvent } from '../../../shared/kernel/interfaces/domain-event.interface';

export class UserRegisteredEvent implements IDomainEvent {
  readonly eventType = 'UserRegistered';

  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly occurredOn: Date
  ) {}
} 