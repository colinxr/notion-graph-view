import { createStoreSlice } from './index';
import { GraphResponseDto, GraphSettingsDto, NodeDto, EdgeDto } from '@/types/api';

// Graph store state
interface GraphState {
  currentGraph: GraphResponseDto | null;
  selectedNode: string | null;
  hoveredNode: string | null;
  zoomLevel: number;
  viewPosition: { x: number; y: number };
  filterOptions: {
    nodeTypes: string[];
    edgeTypes: string[];
    propertyFilters: Array<{
      property: string;
      value: string;
      operator: 'equals' | 'contains' | 'startsWith' | 'endsWith';
    }>;
  };
  displayOptions: {
    showLabels: boolean;
    nodeSize: number;
    edgeWidth: number;
    theme: string;
  };
}

// Initial state
const initialState: GraphState = {
  currentGraph: null,
  selectedNode: null,
  hoveredNode: null,
  zoomLevel: 1,
  viewPosition: { x: 0, y: 0 },
  filterOptions: {
    nodeTypes: [],
    edgeTypes: [],
    propertyFilters: [],
  },
  displayOptions: {
    showLabels: true,
    nodeSize: 10,
    edgeWidth: 1,
    theme: 'default',
  },
};

// Graph store actions
interface GraphActions {
  setCurrentGraph: (graph: GraphResponseDto | null) => void;
  selectNode: (nodeId: string | null) => void;
  hoverNode: (nodeId: string | null) => void;
  setZoomLevel: (level: number) => void;
  setViewPosition: (position: { x: number; y: number }) => void;
  updateFilterOptions: (options: Partial<GraphState['filterOptions']>) => void;
  updateDisplayOptions: (options: Partial<GraphState['displayOptions']>) => void;
  updateGraphSettings: (settings: Partial<GraphSettingsDto>) => void;
  addNode: (node: NodeDto) => void;
  updateNode: (nodeId: string, updates: Partial<NodeDto>) => void;
  removeNode: (nodeId: string) => void;
  addEdge: (edge: EdgeDto) => void;
  updateEdge: (edgeId: string, updates: Partial<EdgeDto>) => void;
  removeEdge: (edgeId: string) => void;
  resetGraphState: () => void;
}

// Create and export the graph store
export const useGraphStore = createStoreSlice<GraphActions, GraphState>(
  'graph',
  initialState,
  (set, get) => ({
    // Set the current graph
    setCurrentGraph: (graph) => set((state) => ({ ...state, currentGraph: graph })),

    // Select a node
    selectNode: (nodeId) => set((state) => ({ ...state, selectedNode: nodeId })),

    // Hover a node
    hoverNode: (nodeId) => set((state) => ({ ...state, hoveredNode: nodeId })),

    // Set the zoom level
    setZoomLevel: (level) => set((state) => ({ ...state, zoomLevel: level })),

    // Set the view position
    setViewPosition: (position) => set((state) => ({ ...state, viewPosition: position })),

    // Update filter options
    updateFilterOptions: (options) =>
      set((state) => ({
        ...state,
        filterOptions: {
          ...state.filterOptions,
          ...options,
        },
      })),

    // Update display options
    updateDisplayOptions: (options) =>
      set((state) => ({
        ...state,
        displayOptions: {
          ...state.displayOptions,
          ...options,
        },
      })),

    // Update graph settings
    updateGraphSettings: (settings) => {
      const { currentGraph } = get();
      if (!currentGraph) return;

      set((state) => ({
        ...state,
        currentGraph: {
          ...currentGraph,
          settings: {
            ...currentGraph.settings,
            ...settings,
          },
        },
      }));
    },

    // Add a new node to the graph
    addNode: (node) => {
      const { currentGraph } = get();
      if (!currentGraph) return;

      set((state) => ({
        ...state,
        currentGraph: {
          ...currentGraph,
          nodes: [...currentGraph.nodes, node],
        },
      }));
    },

    // Update an existing node
    updateNode: (nodeId, updates) => {
      const { currentGraph } = get();
      if (!currentGraph) return;

      set((state) => ({
        ...state,
        currentGraph: {
          ...currentGraph,
          nodes: currentGraph.nodes.map((node) =>
            node.id === nodeId ? { ...node, ...updates } : node
          ),
        },
      }));
    },

    // Remove a node from the graph
    removeNode: (nodeId) => {
      const { currentGraph } = get();
      if (!currentGraph) return;

      set((state) => ({
        ...state,
        currentGraph: {
          ...currentGraph,
          nodes: currentGraph.nodes.filter((node) => node.id !== nodeId),
          // Also remove any edges connected to this node
          edges: currentGraph.edges.filter(
            (edge) => edge.source !== nodeId && edge.target !== nodeId
          ),
        },
      }));
    },

    // Add a new edge to the graph
    addEdge: (edge) => {
      const { currentGraph } = get();
      if (!currentGraph) return;

      set((state) => ({
        ...state,
        currentGraph: {
          ...currentGraph,
          edges: [...currentGraph.edges, edge],
        },
      }));
    },

    // Update an existing edge
    updateEdge: (edgeId, updates) => {
      const { currentGraph } = get();
      if (!currentGraph) return;

      set((state) => ({
        ...state,
        currentGraph: {
          ...currentGraph,
          edges: currentGraph.edges.map((edge) =>
            edge.id === edgeId ? { ...edge, ...updates } : edge
          ),
        },
      }));
    },

    // Remove an edge from the graph
    removeEdge: (edgeId) => {
      const { currentGraph } = get();
      if (!currentGraph) return;

      set((state) => ({
        ...state,
        currentGraph: {
          ...currentGraph,
          edges: currentGraph.edges.filter((edge) => edge.id !== edgeId),
        },
      }));
    },

    // Reset graph state to initial
    resetGraphState: () => set(() => initialState),
  }),
  {
    persist: true,
    persistOptions: {
      name: 'notion-graph-view-graph-storage',
      partialize: (state) => ({
        displayOptions: state.displayOptions,
        // Only persist display settings, not the actual graph data
      }),
    },
  }
); 