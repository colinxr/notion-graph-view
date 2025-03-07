import { IDomainEvent } from '../../../shared/kernel/interfaces/domain-event.interface';

export class UserRegisteredEvent implements IDomainEvent {
  readonly eventName = 'UserRegistered';

  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly occurredOn: Date
  ) {}
} 