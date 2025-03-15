import { createStoreSlice } from './index';
import { UserDto } from '@/types/api';

// User store state
interface UserState {
  user: UserDto | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    sidebarCollapsed: boolean;
    zoomLevel: number;
    defaultLayout: string;
    recentGraphs: string[];
    recentDatabases: string[];
  };
}

// Initial state
const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  accessToken: null,
  preferences: {
    theme: 'system',
    sidebarCollapsed: false,
    zoomLevel: 1,
    defaultLayout: 'force-directed',
    recentGraphs: [],
    recentDatabases: [],
  },
};

// User store actions
interface UserActions {
  setUser: (user: UserDto | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setAccessToken: (token: string | null) => void;
  setTheme: (theme: UserState['preferences']['theme']) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setZoomLevel: (level: number) => void;
  setDefaultLayout: (layout: string) => void;
  addRecentGraph: (graphId: string) => void;
  addRecentDatabase: (databaseId: string) => void;
  clearRecentGraphs: () => void;
  clearRecentDatabases: () => void;
  logout: () => void;
  updateUserPreferences: (preferences: Partial<UserState['preferences']>) => void;
}

// Create and export the user store
export const useUserStore = createStoreSlice<UserActions, UserState>(
  'user',
  initialState,
  (set, get) => ({
    // Set user details
    setUser: (user) => set((state) => ({ ...state, user })),

    // Set authentication status
    setAuthenticated: (isAuthenticated) => set((state) => ({ ...state, isAuthenticated })),

    // Set access token
    setAccessToken: (accessToken) => set((state) => ({ ...state, accessToken })),

    // Set theme preference
    setTheme: (theme) =>
      set((state) => ({
        ...state,
        preferences: {
          ...state.preferences,
          theme,
        },
      })),

    // Set sidebar collapsed state
    setSidebarCollapsed: (collapsed) =>
      set((state) => ({
        ...state,
        preferences: {
          ...state.preferences,
          sidebarCollapsed: collapsed,
        },
      })),

    // Set zoom level preference
    setZoomLevel: (level) =>
      set((state) => ({
        ...state,
        preferences: {
          ...state.preferences,
          zoomLevel: level,
        },
      })),

    // Set default layout preference
    setDefaultLayout: (layout) =>
      set((state) => ({
        ...state,
        preferences: {
          ...state.preferences,
          defaultLayout: layout,
        },
      })),

    // Add a graph to recent graphs
    addRecentGraph: (graphId) => {
      const { preferences } = get();
      const recentGraphs = [
        graphId,
        ...preferences.recentGraphs.filter((id) => id !== graphId),
      ].slice(0, 5); // Keep only 5 most recent

      set((state) => ({
        ...state,
        preferences: {
          ...state.preferences,
          recentGraphs,
        },
      }));
    },

    // Add a database to recent databases
    addRecentDatabase: (databaseId) => {
      const { preferences } = get();
      const recentDatabases = [
        databaseId,
        ...preferences.recentDatabases.filter((id) => id !== databaseId),
      ].slice(0, 5); // Keep only 5 most recent

      set((state) => ({
        ...state,
        preferences: {
          ...state.preferences,
          recentDatabases,
        },
      }));
    },

    // Clear recent graphs
    clearRecentGraphs: () =>
      set((state) => ({
        ...state,
        preferences: {
          ...state.preferences,
          recentGraphs: [],
        },
      })),

    // Clear recent databases
    clearRecentDatabases: () =>
      set((state) => ({
        ...state,
        preferences: {
          ...state.preferences,
          recentDatabases: [],
        },
      })),

    // Logout user
    logout: () =>
      set((state) => ({
        ...state,
        user: null,
        isAuthenticated: false,
        accessToken: null,
        // Keep preferences
      })),

    // Update user preferences
    updateUserPreferences: (preferences) =>
      set((state) => ({
        ...state,
        preferences: {
          ...state.preferences,
          ...preferences,
        },
      })),
  }),
  {
    persist: true,
    persistOptions: {
      name: 'notion-graph-view-user-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
        preferences: state.preferences,
        // Don't persist sensitive user data
      }),
    },
  }
); 