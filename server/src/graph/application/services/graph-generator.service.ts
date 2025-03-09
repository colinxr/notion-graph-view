import { Injectable, Inject } from '@nestjs/common';
import { Graph } from '../../domain/models/graph.entity';
import { NodeType } from '../../domain/models/node.entity';
import { EdgeType } from '../../domain/models/edge.entity';
import { IGraphRepository } from '../../domain/repositories/graph.repository.interface';
import { GraphSettings } from '../../domain/models/graph-settings.value-object';

// Import Notion-related services from the Notion module
// These would be defined in your Notion domain
interface INotionPageRepository {
  findByDatabaseId(databaseId: string, userId: string): Promise<any[]>;
  findById(pageId: string, userId: string): Promise<any>;
  findWithBacklinks(pageId: string, userId: string): Promise<any>;
}

interface INotionDatabaseRepository {
  findById(databaseId: string, userId: string): Promise<any>;
}

interface BacklinkService {
  extractBacklinks(pageId: string, userId: string): Promise<any[]>;
}

@Injectable()
export class GraphGeneratorService {
  constructor(
    @Inject('IGraphRepository')
    private readonly graphRepository: IGraphRepository,
    
    @Inject('INotionPageRepository')
    private readonly notionPageRepository: INotionPageRepository,
    
    @Inject('INotionDatabaseRepository')
    private readonly notionDatabaseRepository: INotionDatabaseRepository,
    
    private readonly backlinkService: BacklinkService,
  ) {}

  /**
   * Generate a graph from a Notion database
   */
  async generateFromDatabase(
    userId: string,
    databaseId: string,
    graphName: string,
    description?: string,
    maxDepth: number = 2, // How deep to follow backlinks
  ): Promise<Graph> {
    // 1. Verify the database exists and user has access to it
    const database = await this.notionDatabaseRepository.findById(databaseId, userId);
    if (!database) {
      throw new Error(`Database with ID ${databaseId} not found or access denied`);
    }

    // 2. Create a new graph with default settings
    const graph = new Graph({
      name: graphName,
      description: description || `Generated from Notion database: ${database.title}`,
      ownerId: userId,
      sourceDatabaseId: databaseId,
      settings: GraphSettings.createDefault().toJSON(),
    });

    // 3. Get all pages in the database
    const pages = await this.notionPageRepository.findByDatabaseId(databaseId, userId);
    
    // Map to track processed pages to avoid duplicates
    const processedPages = new Map();
    
    // 4. Add database as a node
    const databaseNode = graph.addNode({
      notionId: database.id,
      title: database.title,
      type: NodeType.DATABASE,
      icon: database.icon,
      metadata: {
        description: database.description,
        lastModified: database.lastModified,
      },
    });
    
    // 5. Process each page in the database
    for (const page of pages) {
      // Skip if already processed
      if (processedPages.has(page.id)) continue;
      
      // Add page as node
      const pageNode = graph.addNode({
        notionId: page.id,
        title: page.title,
        type: NodeType.PAGE,
        icon: page.icon,
        metadata: {
          description: page.description,
          lastModified: page.lastModified,
          tags: page.tags,
          properties: page.properties,
        },
      });
      
      // Mark as processed
      processedPages.set(page.id, pageNode.id);
      
      // Connect page to database
      graph.addEdge({
        sourceId: databaseNode.id,
        targetId: pageNode.id,
        type: EdgeType.DATABASE_RELATION,
      });
      
      // Process backlinks for this page if maxDepth > 0
      if (maxDepth > 0) {
        await this.processBacklinks(graph, page.id, pageNode.id, userId, processedPages, maxDepth);
      }
    }
    
    // 6. Save the graph
    return this.graphRepository.save(graph);
  }

  /**
   * Generate a graph from a Notion page and its backlinks
   */
  async generateFromPage(
    userId: string,
    pageId: string,
    graphName: string,
    description?: string,
    maxDepth: number = 2, // How deep to follow backlinks
  ): Promise<Graph> {
    // 1. Verify the page exists and user has access to it
    const page = await this.notionPageRepository.findById(pageId, userId);
    if (!page) {
      throw new Error(`Page with ID ${pageId} not found or access denied`);
    }

    // 2. Create a new graph with default settings
    const graph = new Graph({
      name: graphName,
      description: description || `Generated from Notion page: ${page.title}`,
      ownerId: userId,
      settings: GraphSettings.createDefault().toJSON(),
    });

    // Map to track processed pages to avoid duplicates
    const processedPages = new Map();
    
    // 3. Add the root page as a node
    const rootNode = graph.addNode({
      notionId: page.id,
      title: page.title,
      type: NodeType.PAGE,
      icon: page.icon,
      metadata: {
        description: page.description,
        lastModified: page.lastModified,
        tags: page.tags,
        properties: page.properties,
      },
    });
    
    // Mark as processed
    processedPages.set(page.id, rootNode.id);
    
    // 4. Process backlinks for the root page
    await this.processBacklinks(graph, page.id, rootNode.id, userId, processedPages, maxDepth);
    
    // 5. Save the graph
    return this.graphRepository.save(graph);
  }

  /**
   * Process backlinks for a page and add them to the graph
   */
  private async processBacklinks(
    graph: Graph,
    pageId: string,
    nodeId: string,
    userId: string,
    processedPages: Map<string, string>,
    depth: number,
  ): Promise<void> {
    if (depth <= 0) return;
    
    // Get backlinks for this page
    const backlinks = await this.backlinkService.extractBacklinks(pageId, userId);
    
    for (const backlink of backlinks) {
      const sourcePage = backlink.sourcePage;
      
      // Check if we've already processed this page
      let sourceNodeId: string;
      if (processedPages.has(sourcePage.id)) {
        sourceNodeId = processedPages.get(sourcePage.id)!;
      } else {
        // Add the source page as a node
        const sourceNode = graph.addNode({
          notionId: sourcePage.id,
          title: sourcePage.title,
          type: NodeType.PAGE,
          icon: sourcePage.icon,
          metadata: {
            description: sourcePage.description,
            lastModified: sourcePage.lastModified,
            tags: sourcePage.tags,
            properties: sourcePage.properties,
          },
        });
        
        sourceNodeId = sourceNode.id;
        processedPages.set(sourcePage.id, sourceNodeId);
      }
      
      // Add an edge representing the backlink
      graph.addEdge({
        sourceId: sourceNodeId,
        targetId: nodeId,
        type: EdgeType.REFERENCE,
        label: backlink.context,
        isBidirectional: backlink.isBidirectional,
        metadata: {
          context: backlink.context,
          createdAt: backlink.createdAt,
        },
      });
      
      // Recursively process backlinks of this page with decremented depth
      if (depth > 1) {
        await this.processBacklinks(graph, sourcePage.id, sourceNodeId, userId, processedPages, depth - 1);
      }
    }
  }

  /**
   * Generate a combined graph from multiple source graphs
   */
  async combineGraphs(
    userId: string,
    graphIds: string[],
    graphName: string,
    description?: string,
  ): Promise<Graph> {
    if (graphIds.length === 0) {
      throw new Error('At least one graph ID must be provided');
    }
    
    // Load all source graphs and check user access
    const sourceGraphs: Graph[] = [];
    for (const graphId of graphIds) {
      const graph = await this.graphRepository.findById(graphId);
      if (!graph) {
        throw new Error(`Graph with ID ${graphId} not found`);
      }
      
      // Check if user has access
      const hasAccess = graph.ownerId === userId || 
                       graph.sharedWith.includes(userId) || 
                       graph.isPublic;
                      
      if (!hasAccess) {
        throw new Error(`Access denied to graph with ID ${graphId}`);
      }
      
      sourceGraphs.push(graph);
    }
    
    // Create a new combined graph
    const combinedGraph = new Graph({
      name: graphName,
      description: description || `Combined graph from ${sourceGraphs.length} sources`,
      ownerId: userId,
      settings: sourceGraphs[0].settings.toJSON(), // Use settings from first graph
    });
    
    // Merge all source graphs into the combined graph
    for (const sourceGraph of sourceGraphs) {
      combinedGraph.mergeGraph(sourceGraph);
    }
    
    // Save the combined graph
    return this.graphRepository.save(combinedGraph);
  }
} 