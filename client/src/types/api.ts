// API Request/Response Types
// These types define the structure of data sent to and received from the backend API

// User Types
export interface UserDto {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Auth Types
export interface LoginUserDto {
  email: string;
  password: string;
}

export interface RegisterUserDto {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponseDto {
  user: UserDto;
  accessToken: string;
}

// Notion Database Types
export interface NotionDatabaseDto {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  workspaceId: string;
  workspaceName: string;
  properties: Record<string, any>;
  lastSyncedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSyncResultDto {
  database: NotionDatabaseDto;
  changesDetected: boolean;
  message: string;
}

// Graph Types
export interface GraphSettingsDto {
  layout: string;
  theme: string;
  nodeSize: number;
  edgeWidth: number;
  showLabels: boolean;
  groupClusters: boolean;
  customStyles?: Record<string, any>;
}

export interface NodeDto {
  id: string;
  label: string;
  type: string;
  properties: Record<string, any>;
  position?: {
    x: number;
    y: number;
  };
  style?: Record<string, any>;
}

export interface EdgeDto {
  id: string;
  source: string;
  target: string;
  label?: string;
  type: string;
  properties?: Record<string, any>;
  style?: Record<string, any>;
}

export interface CreateGraphDto {
  name: string;
  description?: string;
  settings?: GraphSettingsDto;
}

export interface UpdateGraphDto {
  name?: string;
  description?: string;
  settings?: Partial<GraphSettingsDto>;
}

export interface GraphSummaryResponseDto {
  id: string;
  name: string;
  description?: string;
  owner: {
    id: string;
    name: string;
  };
  nodeCount: number;
  edgeCount: number;
  isPublic: boolean;
  lastModified: string;
  createdAt: string;
}

export interface GraphResponseDto {
  id: string;
  name: string;
  description?: string;
  owner: {
    id: string;
    name: string;
  };
  nodes: NodeDto[];
  edges: EdgeDto[];
  settings: GraphSettingsDto;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNodeDto {
  label: string;
  type: string;
  properties?: Record<string, any>;
  position?: {
    x: number;
    y: number;
  };
}

export interface UpdateNodeDto {
  label?: string;
  properties?: Record<string, any>;
  position?: {
    x: number;
    y: number;
  };
}

export interface CreateEdgeDto {
  source: string;
  target: string;
  label?: string;
  type: string;
  properties?: Record<string, any>;
}

export interface UpdateEdgeDto {
  label?: string;
  properties?: Record<string, any>;
}

// API Error Response
export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    totalPages: number;
  };
} 