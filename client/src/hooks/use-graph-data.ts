import { useApiQuery, useApiMutation, useApiDeleteMutation, useApiPutMutation, createEndpoint } from './use-api';
import { AxiosError } from 'axios';
import {
  GraphResponseDto,
  GraphSummaryResponseDto,
  CreateGraphDto,
  UpdateGraphDto,
  CreateNodeDto,
  UpdateNodeDto,
  CreateEdgeDto,
  UpdateEdgeDto,
  ApiErrorResponse,
} from '@/types/api';
import { useUIStore } from '@/store/ui-store';
import { useUserStore } from '@/store/user-store';
import { useGraphStore } from '@/store/graph-store';

/**
 * Hook for fetching all graphs accessible to the user
 */
export function useGraphs(ownedOnly: boolean = false) {
  const addToast = useUIStore((state) => state.addToast);

  return useApiQuery<GraphSummaryResponseDto[]>(`/graphs${ownedOnly ? '?owned=true' : ''}`, {
    onError: (error: AxiosError<ApiErrorResponse>) => {
      addToast({
        type: 'error',
        title: 'Failed to fetch graphs',
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

/**
 * Hook for fetching a specific graph by ID
 */
export function useGraph(graphId: string, options?: { enabled?: boolean }) {
  const addToast = useUIStore((state) => state.addToast);
  const addRecentGraph = useUserStore((state) => state.addRecentGraph);
  const setCurrentGraph = useGraphStore((state) => state.setCurrentGraph);

  return useApiQuery<GraphResponseDto>(`/graphs/${graphId}`, {
    enabled: options?.enabled !== false && !!graphId,
    onSuccess: (data: GraphResponseDto) => {
      // Add to recent graphs
      addRecentGraph(data.id);
      // Set as current graph in the store
      setCurrentGraph(data);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      addToast({
        type: 'error',
        title: 'Failed to fetch graph',
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

/**
 * Hook for creating a new graph
 */
export function useCreateGraph() {
  const addToast = useUIStore((state) => state.addToast);

  return useApiMutation<GraphResponseDto, CreateGraphDto>('/graphs', {
    onSuccess: (data: GraphResponseDto) => {
      addToast({
        type: 'success',
        title: 'Graph created',
        description: `Successfully created graph "${data.name}"`,
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      addToast({
        type: 'error',
        title: 'Failed to create graph',
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

/**
 * Hook for updating a graph
 */
export function useUpdateGraph(graphId: string) {
  const addToast = useUIStore((state) => state.addToast);

  return useApiPutMutation<GraphResponseDto, UpdateGraphDto>(`/graphs/${graphId}`, {
    onSuccess: (data: GraphResponseDto) => {
      addToast({
        type: 'success',
        title: 'Graph updated',
        description: `Successfully updated graph "${data.name}"`,
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      addToast({
        type: 'error',
        title: 'Failed to update graph',
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

/**
 * Hook for deleting a graph
 */
export function useDeleteGraph(graphId: string) {
  const addToast = useUIStore((state) => state.addToast);

  return useApiDeleteMutation<void>(`/graphs/${graphId}`, {
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Graph deleted',
        description: 'Graph was successfully deleted',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      addToast({
        type: 'error',
        title: 'Failed to delete graph',
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

/**
 * Hook for adding a node to a graph
 */
export function useAddNode(graphId: string) {
  const addToast = useUIStore((state) => state.addToast);

  return useApiMutation<GraphResponseDto, CreateNodeDto>(`/graphs/${graphId}/nodes`, {
    onSuccess: (data: GraphResponseDto) => {
      addToast({
        type: 'success',
        title: 'Node added',
        description: 'Node was successfully added to the graph',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      addToast({
        type: 'error',
        title: 'Failed to add node',
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

/**
 * Hook for updating a node in a graph
 */
export function useUpdateNode(graphId: string, nodeId: string) {
  const addToast = useUIStore((state) => state.addToast);

  return useApiPutMutation<GraphResponseDto, UpdateNodeDto>(`/graphs/${graphId}/nodes/${nodeId}`, {
    onSuccess: (data: GraphResponseDto) => {
      addToast({
        type: 'success',
        title: 'Node updated',
        description: 'Node was successfully updated',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      addToast({
        type: 'error',
        title: 'Failed to update node',
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

/**
 * Hook for removing a node from a graph
 */
export function useRemoveNode(graphId: string, nodeId: string) {
  const addToast = useUIStore((state) => state.addToast);

  return useApiDeleteMutation<GraphResponseDto>(`/graphs/${graphId}/nodes/${nodeId}`, {
    onSuccess: (data: GraphResponseDto) => {
      addToast({
        type: 'success',
        title: 'Node removed',
        description: 'Node was successfully removed from the graph',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      addToast({
        type: 'error',
        title: 'Failed to remove node',
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

/**
 * Hook for adding an edge to a graph
 */
export function useAddEdge(graphId: string) {
  const addToast = useUIStore((state) => state.addToast);

  return useApiMutation<GraphResponseDto, CreateEdgeDto>(`/graphs/${graphId}/edges`, {
    onSuccess: (data: GraphResponseDto) => {
      addToast({
        type: 'success',
        title: 'Edge added',
        description: 'Edge was successfully added to the graph',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      addToast({
        type: 'error',
        title: 'Failed to add edge',
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

/**
 * Hook for updating an edge in a graph
 */
export function useUpdateEdge(graphId: string, edgeId: string) {
  const addToast = useUIStore((state) => state.addToast);

  return useApiPutMutation<GraphResponseDto, UpdateEdgeDto>(`/graphs/${graphId}/edges/${edgeId}`, {
    onSuccess: (data: GraphResponseDto) => {
      addToast({
        type: 'success',
        title: 'Edge updated',
        description: 'Edge was successfully updated',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      addToast({
        type: 'error',
        title: 'Failed to update edge',
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

/**
 * Hook for removing an edge from a graph
 */
export function useRemoveEdge(graphId: string, edgeId: string) {
  const addToast = useUIStore((state) => state.addToast);

  return useApiDeleteMutation<GraphResponseDto>(`/graphs/${graphId}/edges/${edgeId}`, {
    onSuccess: (data: GraphResponseDto) => {
      addToast({
        type: 'success',
        title: 'Edge removed',
        description: 'Edge was successfully removed from the graph',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      addToast({
        type: 'error',
        title: 'Failed to remove edge',
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

/**
 * Hook for generating a graph from a Notion database
 */
export function useGenerateGraphFromDatabase() {
  const addToast = useUIStore((state) => state.addToast);

  return useApiMutation<GraphResponseDto, { databaseId: string; name: string; description?: string; maxDepth?: number }>(
    '/graphs/generate/database/:databaseId',
    {
      onSuccess: (data: GraphResponseDto) => {
        addToast({
          type: 'success',
          title: 'Graph generated',
          description: `Successfully generated graph "${data.name}" from Notion database`,
        });
      },
      onError: (error: AxiosError<ApiErrorResponse>) => {
        addToast({
          type: 'error',
          title: 'Failed to generate graph',
          description: error.response?.data?.message || error.message,
        });
      },
    }
  );
}