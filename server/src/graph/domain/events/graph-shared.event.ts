import { Graph } from '../models/graph.entity';

/**
 * Event emitted when a graph is shared with a user or made public
 */
export class GraphSharedEvent {
  constructor(
    /** The shared graph */
    public readonly graph: Graph,
    
    /** User who shared the graph */
    public readonly sharedByUserId: string,
    
    /** User who the graph was shared with (if applicable) */
    public readonly sharedWithUserId?: string,
    
    /** Whether the graph was made public */
    public readonly madePublic: boolean = false,
    
    /** Timestamp when the event occurred */
    public readonly timestamp: Date = new Date(),
  ) {}
} 