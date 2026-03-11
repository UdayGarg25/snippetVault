import { create } from "zustand";

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Snippet editor
  editorLanguage: string;
  setEditorLanguage: (language: string) => void;

  // Search & filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  toggleTag: (tag: string) => void;

  // View mode
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Sidebar
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Snippet editor
  editorLanguage: "javascript",
  setEditorLanguage: (language) => set({ editorLanguage: language }),

  // Search & filter
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectedTags: [],
  setSelectedTags: (tags) => set({ selectedTags: tags }),
  toggleTag: (tag) =>
    set((state) => ({
      selectedTags: state.selectedTags.includes(tag)
        ? state.selectedTags.filter((t) => t !== tag)
        : [...state.selectedTags, tag],
    })),

  // View mode
  viewMode: "grid",
  setViewMode: (mode) => set({ viewMode: mode }),
}));
