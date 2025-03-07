import { IDomainEvent } from '../../../shared/kernel/interfaces/domain-event.interface';

export class UserAuthenticatedEvent implements IDomainEvent {
  readonly eventName = 'UserAuthenticated';

  constructor(
    public readonly userId: string,
    public readonly occurredOn: Date
  ) {}
} 