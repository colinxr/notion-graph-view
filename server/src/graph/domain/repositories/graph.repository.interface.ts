import { Graph } from '../models/graph.entity';

/**
 * Interface for the Graph repository
 */
export interface IGraphRepository {
  /**
   * Find a graph by ID
   * @param id Graph ID
   * @returns Promise resolving to the graph or null if not found
   */
  findById(id: string): Promise<Graph | null>;
  
  /**
   * Find graphs owned by a user
   * @param ownerId User ID of the owner
   * @returns Promise resolving to array of graphs
   */
  findByOwner(ownerId: string): Promise<Graph[]>;

  /**
   * Find graphs accessible to a user (either owned or shared with them)
   * @param userId User ID
   * @returns Promise resolving to array of graphs
   */
  findAccessibleByUser(userId: string): Promise<Graph[]>;

  /**
   * Find graphs by source database ID
   * @param databaseId Notion database ID
   * @returns Promise resolving to array of graphs
   */
  findBySourceDatabase(databaseId: string): Promise<Graph[]>;

  /**
   * Find public graphs
   * @param limit Maximum number of graphs to return
   * @param offset Pagination offset
   * @returns Promise resolving to array of graphs
   */
  findPublicGraphs(limit?: number, offset?: number): Promise<Graph[]>;

  /**
   * Find graphs by tags
   * @param tags Array of tags to match
   * @param matchAll If true, graphs must have all tags; if false, any of the tags
   * @returns Promise resolving to array of graphs
   */
  findByTags(tags: string[], matchAll?: boolean): Promise<Graph[]>;

  /**
   * Search graphs by name or description
   * @param query Search query
   * @param ownerId Optional owner ID to restrict search
   * @returns Promise resolving to array of graphs
   */
  search(query: string, ownerId?: string): Promise<Graph[]>;

  /**
   * Save a graph
   * @param graph Graph to save
   * @returns Promise resolving to the saved graph
   */
  save(graph: Graph): Promise<Graph>;

  /**
   * Delete a graph
   * @param id Graph ID
   * @returns Promise resolving to boolean indicating success
   */
  delete(id: string): Promise<boolean>;

  /**
   * Count graphs by owner
   * @param ownerId Owner user ID
   * @returns Promise resolving to count
   */
  countByOwner(ownerId: string): Promise<number>;
} 