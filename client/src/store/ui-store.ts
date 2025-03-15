import { createStoreSlice } from './index';

// Toast type definition
export interface Toast {
  id: string;
  type: 'default' | 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

// Modal type definition
export interface Modal {
  id: string;
  component: string;
  props?: Record<string, any>;
}

// UI store state
interface UIState {
  isMobileMenuOpen: boolean;
  isSidebarOpen: boolean;
  isLoading: boolean;
  currentRoute: string;
  toasts: Toast[];
  activeModals: Modal[];
  searchQuery: string;
  isDarkMode: boolean;
}

// Initial state
const initialState: UIState = {
  isMobileMenuOpen: false,
  isSidebarOpen: true,
  isLoading: false,
  currentRoute: '/',
  toasts: [],
  activeModals: [],
  searchQuery: '',
  isDarkMode: false,
};

// UI store actions
interface UIActions {
  toggleMobileMenu: (isOpen?: boolean) => void;
  toggleSidebar: (isOpen?: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setCurrentRoute: (route: string) => void;
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  openModal: (modal: Omit<Modal, 'id'>) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  setSearchQuery: (query: string) => void;
  setDarkMode: (isDark: boolean) => void;
}

// Create and export the UI store
export const useUIStore = createStoreSlice<UIActions, UIState>(
  'ui',
  initialState,
  (set, get) => ({
    // Toggle mobile menu
    toggleMobileMenu: (isOpen) =>
      set((state) => ({
        ...state,
        isMobileMenuOpen: isOpen !== undefined ? isOpen : !state.isMobileMenuOpen,
      })),

    // Toggle sidebar
    toggleSidebar: (isOpen) =>
      set((state) => ({
        ...state,
        isSidebarOpen: isOpen !== undefined ? isOpen : !state.isSidebarOpen,
      })),

    // Set loading state
    setLoading: (isLoading) => set((state) => ({ ...state, isLoading })),

    // Set current route
    setCurrentRoute: (route) => set((state) => ({ ...state, currentRoute: route })),

    // Add a toast notification
    addToast: (toast) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      set((state) => ({
        ...state,
        toasts: [...state.toasts, { ...toast, id }],
      }));
      return id;
    },

    // Remove a toast notification
    removeToast: (id) =>
      set((state) => ({
        ...state,
        toasts: state.toasts.filter((toast) => toast.id !== id),
      })),

    // Clear all toast notifications
    clearToasts: () => set((state) => ({ ...state, toasts: [] })),

    // Open a modal
    openModal: (modal) => {
      const id = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      set((state) => ({
        ...state,
        activeModals: [...state.activeModals, { ...modal, id }],
      }));
      return id;
    },

    // Close a modal
    closeModal: (id) =>
      set((state) => ({
        ...state,
        activeModals: state.activeModals.filter((modal) => modal.id !== id),
      })),

    // Close all modals
    closeAllModals: () => set((state) => ({ ...state, activeModals: [] })),

    // Set search query
    setSearchQuery: (query) => set((state) => ({ ...state, searchQuery: query })),

    // Set dark mode
    setDarkMode: (isDark) => set((state) => ({ ...state, isDarkMode: isDark })),
  }),
  {
    persist: false, // UI state doesn't need to persist between sessions
  }
); 