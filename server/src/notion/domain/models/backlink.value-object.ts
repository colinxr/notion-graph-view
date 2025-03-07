import { IValueObject } from '../../../shared/kernel/interfaces/value-object.interface';

export interface BacklinkProps {
  id: string;
  sourcePageId: string;
  sourcePageTitle: string;
  targetPageId: string;
  createdAt: Date;
  context?: string;
}

export class Backlink implements IValueObject<Backlink> {
  private readonly _id: string;
  private readonly _sourcePageId: string;
  private readonly _sourcePageTitle: string;
  private readonly _targetPageId: string;
  private readonly _createdAt: Date;
  private readonly _context?: string;

  constructor(props: BacklinkProps) {
    this._id = props.id;
    this._sourcePageId = props.sourcePageId;
    this._sourcePageTitle = props.sourcePageTitle;
    this._targetPageId = props.targetPageId;
    this._createdAt = props.createdAt;
    this._context = props.context;
  }

  get id(): string {
    return this._id;
  }

  get sourcePageId(): string {
    return this._sourcePageId;
  }

  get sourcePageTitle(): string {
    return this._sourcePageTitle;
  }

  get targetPageId(): string {
    return this._targetPageId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get context(): string | undefined {
    return this._context;
  }

  equals(other: Backlink): boolean {
    if (!(other instanceof Backlink)) return false;
    
    return this.id === other.id &&
           this.sourcePageId === other.sourcePageId &&
           this.targetPageId === other.targetPageId;
  }
}
