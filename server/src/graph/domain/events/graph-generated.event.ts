import { Graph } from '../models/graph.entity';

/**
 * Event emitted when a new graph is generated
 */
export class GraphGeneratedEvent {
  constructor(
    /** The generated graph */
    public readonly graph: Graph,
    
    /** User who generated the graph */
    public readonly userId: string,
    
    /** Source type from which the graph was generated */
    public readonly sourceType: 'database' | 'page' | 'custom',
    
    /** Source ID from which the graph was generated */
    public readonly sourceId?: string,
    
    /** Timestamp when the event occurred */
    public readonly timestamp: Date = new Date(),
  ) {}
} 