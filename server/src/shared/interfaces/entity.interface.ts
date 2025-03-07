export interface IEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAggregateRoot extends IEntity {
  domainEvents: Array<any>; // Will be typed properly when we implement domain events
  clearEvents(): void;
  addEvent(event: any): void;
} 