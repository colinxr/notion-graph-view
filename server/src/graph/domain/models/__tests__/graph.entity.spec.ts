import { Graph } from '../graph.entity';
import { Node, NodeType } from '../node.entity';
import { Edge, EdgeType } from '../edge.entity';
import { GraphSettings, LayoutAlgorithm, GraphTheme } from '../graph-settings.value-object';

describe('Graph Entity', () => {
  describe('initialization', () => {
    it('should create a graph with the provided data', () => {
      // Arrange
      const graphData = {
        id: 'graph-123',
        name: 'Test Graph',
        ownerId: 'user-123',
        description: 'Test description',
        nodes: [],
        edges: [],
        settings: {
          layout: LayoutAlgorithm.FORCE_DIRECTED,
          visualSettings: {
            theme: GraphTheme.LIGHT,
            nodeSize: {
              default: 10,
              scaleByConnections: true,
              min: 5,
              max: 20,
            },
            edgeSettings: {
              thickness: 1,
              scaleByWeight: true,
              style: 'solid' as 'solid' | 'dashed' | 'dotted',
            },
            showLabels: true,
            showIcons: true,
            antialiasing: true,
          },
          relationshipSettings: {
            showParentChild: true,
            showDatabaseRelations: true,
            showBacklinks: true,
            highlightBidirectionalLinks: true,
          },
          filterSettings: {
            includePages: true,
            includeDatabases: true,
            onlyShowNeighbors: false,
          },
          physicsSettings: {
            gravitationalConstant: -50,
            springConstant: 0.08,
            springLength: 100,
            damping: 0.9,
            enabled: true,
          },
          interactionSettings: {
            draggable: true,
            zoomLimits: {
              min: 0.1,
              max: 2,
            },
            clickBehavior: 'select' as 'select' | 'expand' | 'navigate',
            multiSelect: true,
            hideDisconnectedOnSelect: false,
            showDetailsOnHover: true,
          },
        },
      };

      // Act
      const graph = new Graph(graphData);

      // Assert
      expect(graph.id).toBe('graph-123');
      expect(graph.name).toBe('Test Graph');
      expect(graph.ownerId).toBe('user-123');
      expect(graph.description).toBe('Test description');
      expect(graph.nodes).toEqual([]);
      expect(graph.edges).toEqual([]);
      expect(graph.settings).toBeInstanceOf(GraphSettings);
      expect(graph.settings.layout).toBe(LayoutAlgorithm.FORCE_DIRECTED);
    });

    it('should generate an ID if not provided', () => {
      // Arrange
      const graphData = {
        name: 'Test Graph',
        ownerId: 'user-123',
      };

      // Act
      const graph = new Graph(graphData);

      // Assert
      expect(graph.id).toBeDefined();
      expect(typeof graph.id).toBe('string');
      expect(graph.id.length).toBeGreaterThan(0);
    });

    it('should initialize with default values for optional properties', () => {
      // Arrange
      const graphData = {
        name: 'Test Graph',
        ownerId: 'user-123',
      };

      // Act
      const graph = new Graph(graphData);

      // Assert
      expect(graph.description).toBe('');
      expect(graph.isPublic).toBe(false);
      expect(graph.sharedWith).toEqual([]);
      expect(graph.tags).toEqual([]);
      expect(graph.nodes).toEqual([]);
      expect(graph.edges).toEqual([]);
      expect(graph.settings).toBeInstanceOf(GraphSettings);
    });
  });

  describe('graph operations', () => {
    let graph: Graph;

    beforeEach(() => {
      graph = new Graph({
        name: 'Test Graph',
        ownerId: 'user-123',
      });
    });

    describe('node operations', () => {
      it('should add a node', () => {
        // Arrange
        const nodeData = {
          notionId: 'notion-page-123',
          title: 'Test Page',
          type: NodeType.PAGE,
        };

        // Act
        const node = graph.addNode(nodeData);

        // Assert
        expect(graph.nodes.length).toBe(1);
        expect(graph.nodes[0]).toBe(node);
        expect(node.notionId).toBe('notion-page-123');
        expect(node.title).toBe('Test Page');
      });

      it('should get a node by ID', () => {
        // Arrange
        const node = graph.addNode({
          notionId: 'notion-page-123',
          title: 'Test Page',
          type: NodeType.PAGE,
        });

        // Act
        const retrievedNode = graph.getNode(node.id);

        // Assert
        expect(retrievedNode).toBe(node);
      });

      it('should remove a node and its connected edges', () => {
        // Arrange
        const node1 = graph.addNode({
          notionId: 'notion-page-123',
          title: 'Test Page 1',
          type: NodeType.PAGE,
        });
        
        const node2 = graph.addNode({
          notionId: 'notion-page-456',
          title: 'Test Page 2',
          type: NodeType.PAGE,
        });
        
        const edge = graph.addEdge({
          sourceId: node1.id,
          targetId: node2.id,
          type: EdgeType.REFERENCE,
        });

        expect(graph.nodes.length).toBe(2);
        expect(graph.edges.length).toBe(1);

        // Act
        const result = graph.removeNode(node1.id);

        // Assert
        expect(result).toBe(true);
        expect(graph.nodes.length).toBe(1);
        expect(graph.edges.length).toBe(0);
        expect(graph.getNode(node1.id)).toBeUndefined();
        expect(graph.getEdge(edge!.id)).toBeUndefined();
      });
    });

    describe('edge operations', () => {
      let node1: Node;
      let node2: Node;

      beforeEach(() => {
        node1 = graph.addNode({
          notionId: 'notion-page-123',
          title: 'Test Page 1',
          type: NodeType.PAGE,
        });
        
        node2 = graph.addNode({
          notionId: 'notion-page-456',
          title: 'Test Page 2',
          type: NodeType.PAGE,
        });
      });

      it('should add an edge between nodes', () => {
        // Act
        const edge = graph.addEdge({
          sourceId: node1.id,
          targetId: node2.id,
          type: EdgeType.REFERENCE,
        });

        // Assert
        expect(edge).toBeDefined();
        expect(graph.edges.length).toBe(1);
        expect(graph.edges[0]).toBe(edge);
        expect(edge!.sourceId).toBe(node1.id);
        expect(edge!.targetId).toBe(node2.id);
      });

      it('should not add an edge if source or target node does not exist', () => {
        // Act
        const edge = graph.addEdge({
          sourceId: 'non-existent-node',
          targetId: node2.id,
          type: EdgeType.REFERENCE,
        });

        // Assert
        expect(edge).toBeNull();
        expect(graph.edges.length).toBe(0);
      });

      it('should get an edge by ID', () => {
        // Arrange
        const edge = graph.addEdge({
          sourceId: node1.id,
          targetId: node2.id,
          type: EdgeType.REFERENCE,
        });

        // Act
        const retrievedEdge = graph.getEdge(edge!.id);

        // Assert
        expect(retrievedEdge).toBe(edge);
      });

      it('should remove an edge', () => {
        // Arrange
        const edge = graph.addEdge({
          sourceId: node1.id,
          targetId: node2.id,
          type: EdgeType.REFERENCE,
        });

        expect(graph.edges.length).toBe(1);

        // Act
        const result = graph.removeEdge(edge!.id);

        // Assert
        expect(result).toBe(true);
        expect(graph.edges.length).toBe(0);
        expect(graph.getEdge(edge!.id)).toBeUndefined();
      });

      it('should get edges connected to a node', () => {
        // Arrange
        const node3 = graph.addNode({
          notionId: 'notion-page-789',
          title: 'Test Page 3',
          type: NodeType.PAGE,
        });
        
        const edge1 = graph.addEdge({
          sourceId: node1.id,
          targetId: node2.id,
          type: EdgeType.REFERENCE,
        });
        
        const edge2 = graph.addEdge({
          sourceId: node1.id,
          targetId: node3.id,
          type: EdgeType.REFERENCE,
        });
        
        const edge3 = graph.addEdge({
          sourceId: node2.id,
          targetId: node3.id,
          type: EdgeType.REFERENCE,
        });

        // Act
        const node1Edges = graph.getNodeEdges(node1.id);

        // Assert
        expect(node1Edges.length).toBe(2);
        expect(node1Edges).toContain(edge1);
        expect(node1Edges).toContain(edge2);
        expect(node1Edges).not.toContain(edge3);
      });

      it('should get nodes connected to a node', () => {
        // Arrange
        const node3 = graph.addNode({
          notionId: 'notion-page-789',
          title: 'Test Page 3',
          type: NodeType.PAGE,
        });
        
        graph.addEdge({
          sourceId: node1.id,
          targetId: node2.id,
          type: EdgeType.REFERENCE,
        });
        
        graph.addEdge({
          sourceId: node1.id,
          targetId: node3.id,
          type: EdgeType.REFERENCE,
        });

        // Act
        const connectedNodes = graph.getConnectedNodes(node1.id);

        // Assert
        expect(connectedNodes.length).toBe(2);
        expect(connectedNodes).toContain(node2);
        expect(connectedNodes).toContain(node3);
      });
    });

    describe('graph-level operations', () => {
      it('should update metadata', () => {
        // Act
        graph.updateMetadata({
          name: 'Updated Graph',
          description: 'Updated description',
          tags: ['tag1', 'tag2'],
        });

        // Assert
        expect(graph.name).toBe('Updated Graph');
        expect(graph.description).toBe('Updated description');
        expect(graph.tags).toEqual(['tag1', 'tag2']);
      });

      it('should update settings', () => {
        // Act
        graph.updateSettings({
          layout: LayoutAlgorithm.HIERARCHICAL,
          visualSettings: {
            theme: GraphTheme.DARK,
            // Include all required properties
            nodeSize: {
              default: 15,
              scaleByConnections: false,
              min: 10,
              max: 30,
            },
            edgeSettings: {
              thickness: 2,
              scaleByWeight: true,
              style: 'dashed',
            },
            showLabels: true,
            showIcons: true,
            antialiasing: true,
          },
        });

        // Assert
        expect(graph.settings.layout).toBe(LayoutAlgorithm.HIERARCHICAL);
        expect(graph.settings.visualSettings.theme).toBe(GraphTheme.DARK);
      });

      it('should share with a user', () => {
        // Act
        graph.shareWithUser('user-456');

        // Assert
        expect(graph.sharedWith).toContain('user-456');
      });

      it('should not add duplicate users to sharedWith', () => {
        // Arrange
        graph.shareWithUser('user-456');
        
        // Act
        graph.shareWithUser('user-456');
        
        // Assert
        expect(graph.sharedWith.length).toBe(1);
        expect(graph.sharedWith).toEqual(['user-456']);
      });

      it('should unshare with a user', () => {
        // Arrange
        graph.shareWithUser('user-456');
        graph.shareWithUser('user-789');
        
        // Act
        graph.unshareFromUser('user-456');
        
        // Assert
        expect(graph.sharedWith).not.toContain('user-456');
        expect(graph.sharedWith).toContain('user-789');
        expect(graph.sharedWith.length).toBe(1);
      });

      it('should set public visibility', () => {
        // Act
        graph.setPublicVisibility(true);
        
        // Assert
        expect(graph.isPublic).toBe(true);
        
        // Act again
        graph.setPublicVisibility(false);
        
        // Assert again
        expect(graph.isPublic).toBe(false);
      });

      it('should clear all nodes and edges', () => {
        // Arrange
        graph.addNode({
          notionId: 'notion-page-123',
          title: 'Test Page 1',
          type: NodeType.PAGE,
        });
        
        graph.addNode({
          notionId: 'notion-page-456',
          title: 'Test Page 2',
          type: NodeType.PAGE,
        });
        
        expect(graph.nodes.length).toBe(2);
        
        // Act
        graph.clear();
        
        // Assert
        expect(graph.nodes.length).toBe(0);
        expect(graph.edges.length).toBe(0);
      });

      it('should merge another graph', () => {
        // Arrange
        const otherGraph = new Graph({
          name: 'Other Graph',
          ownerId: 'user-123',
        });
        
        const node1 = graph.addNode({
          id: 'node-1',
          notionId: 'notion-page-123',
          title: 'Test Page 1',
          type: NodeType.PAGE,
        });
        
        const node2 = otherGraph.addNode({
          id: 'node-2',
          notionId: 'notion-page-456',
          title: 'Test Page 2',
          type: NodeType.PAGE,
        });
        
        const node3 = otherGraph.addNode({
          id: 'node-3',
          notionId: 'notion-page-789',
          title: 'Test Page 3',
          type: NodeType.PAGE,
        });
        
        otherGraph.addEdge({
          id: 'edge-1',
          sourceId: node2.id,
          targetId: node3.id,
          type: EdgeType.REFERENCE,
        });
        
        // Act
        graph.mergeGraph(otherGraph);
        
        // Assert
        expect(graph.nodeCount).toBe(3);
        expect(graph.edgeCount).toBe(1);
        expect(graph.getNode('node-1')).toBeDefined();
        expect(graph.getNode('node-2')).toBeDefined();
        expect(graph.getNode('node-3')).toBeDefined();
        expect(graph.getEdge('edge-1')).toBeDefined();
      });
    });

    describe('utility methods', () => {
      it('should check if graph is empty', () => {
        // Initially empty
        expect(graph.isEmpty).toBe(true);
        
        // Add a node
        graph.addNode({
          notionId: 'notion-page-123',
          title: 'Test Page',
          type: NodeType.PAGE,
        });
        
        // Not empty anymore
        expect(graph.isEmpty).toBe(false);
        
        // Clear the graph
        graph.clear();
        
        // Empty again
        expect(graph.isEmpty).toBe(true);
      });

      it('should return node and edge counts', () => {
        expect(graph.nodeCount).toBe(0);
        expect(graph.edgeCount).toBe(0);
        
        const node1 = graph.addNode({
          notionId: 'notion-page-123',
          title: 'Test Page 1',
          type: NodeType.PAGE,
        });
        
        const node2 = graph.addNode({
          notionId: 'notion-page-456',
          title: 'Test Page 2',
          type: NodeType.PAGE,
        });
        
        graph.addEdge({
          sourceId: node1.id,
          targetId: node2.id,
          type: EdgeType.REFERENCE,
        });
        
        expect(graph.nodeCount).toBe(2);
        expect(graph.edgeCount).toBe(1);
      });

      it('should convert to JSON representation', () => {
        // Arrange
        const graph = new Graph({
          name: 'Test Graph',
          ownerId: 'user-123',
        });
        
        const node1 = graph.addNode({
          notionId: 'notion-page-123',
          title: 'Test Page 1',
          type: NodeType.PAGE,
        });
        
        const node2 = graph.addNode({
          notionId: 'notion-page-456',
          title: 'Test Page 2',
          type: NodeType.PAGE,
        });
        
        const edge = graph.addEdge({
          sourceId: node1.id,
          targetId: node2.id,
          type: EdgeType.REFERENCE,
        });
        
        graph.updateMetadata({
          name: 'Updated Graph',
          description: 'Updated description',
          tags: ['tag1', 'tag2'],
        });
        
        // Act
        const json = graph.toJSON();
        
        // Assert
        expect(json.id).toBe(graph.id);
        expect(json.name).toBe('Updated Graph');
        expect(json.description).toBe('Updated description');
        expect(json.tags).toEqual(['tag1', 'tag2']);
        expect(json.nodes).toBeDefined();
        expect(json.edges).toBeDefined();
        expect(json.nodes?.length).toBe(2);
        expect(json.edges?.length).toBe(1);
        
        // Check that nodes and edges are serialized
        expect(json.nodes && json.nodes[0].id).toBe(node1.id);
        expect(json.nodes && json.nodes[1].id).toBe(node2.id);
        expect(json.edges && json.edges[0].id).toBe(edge!.id);
      });
    });
  });
}); 