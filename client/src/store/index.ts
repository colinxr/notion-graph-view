import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Root store type definition
export interface RootStore {
  // Stores can be combined here if needed
}

// Create and export a singleton instance of the root store
export const useRootStore = create<RootStore>()(
  (set, get) => ({
    // Root store state and actions
  })
);

// Helper function to create a typed selector
export function createSelector<T, U>(selector: (state: T) => U) {
  return selector;
}

// Create store slice helper function for modular store creation
export function createStoreSlice<T, U>(
  sliceName: string,
  initialState: U,
  storeActions: (set: (fn: (state: U) => U) => void, get: () => U) => T,
  options?: {
    persist?: boolean;
    persistOptions?: {
      name?: string;
      storage?: any;
      partialize?: (state: T & U) => any;
    };
  }
) {
  // This is a helper function to make it easier to create and combine store slices
  const createSlice = (set: any, get: any) => ({
    ...initialState,
    ...storeActions(set, get),
  });

  if (options?.persist) {
    return create<T & U>()(
      persist(
        (set, get) => createSlice(set, get),
        {
          name: options.persistOptions?.name || `${sliceName}-storage`,
          storage: options.persistOptions?.storage || (typeof window !== 'undefined' ? window.localStorage : undefined),
          partialize: options.persistOptions?.partialize,
        }
      )
    );
  }

  return create<T & U>()((set, get) => createSlice(set, get));
} 