export interface IEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IAggregateRoot extends IEntity {
    domainEvents: Array<any>;
    clearEvents(): void;
    addEvent(event: any): void;
}
