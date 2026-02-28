import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type ViewMode = 'grid' | 'list'

export interface UiState {
  folders: {
    viewMode: ViewMode
    currentFolderId: string | null
    searchQuery: string
    isCreatingFolder: boolean
    isCreatingDocument: boolean
    selectedItems: string[]
    sortBy: 'name' | 'modified' | 'size'
    sortOrder: 'asc' | 'desc'
  }
  theme: {
    mode: 'light' | 'dark'
  }
  sidebar: {
    isCollapsed: boolean
  }
  modals: {
    createFolder: boolean
    createDocument: boolean
    deleteConfirm: {
      isOpen: boolean
      itemId: string | null
      itemName: string | null
      itemType: 'folder' | 'document' | null
    }
  }
}

const initialState: UiState = {
  folders: {
    viewMode: 'grid',
    currentFolderId: null,
    searchQuery: '',
    isCreatingFolder: false,
    isCreatingDocument: false,
    selectedItems: [],
    sortBy: 'name',
    sortOrder: 'asc',
  },
  theme: {
    mode: 'light',
  },
  sidebar: {
    isCollapsed: false,
  },
  modals: {
    createFolder: false,
    createDocument: false,
    deleteConfirm: {
      isOpen: false,
      itemId: null,
      itemName: null,
      itemType: null,
    },
  },
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Folders UI actions
    setViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.folders.viewMode = action.payload
    },
    
    setCurrentFolder: (state, action: PayloadAction<string | null>) => {
      state.folders.currentFolderId = action.payload
    },
    
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.folders.searchQuery = action.payload
    },
    
    clearSearchQuery: (state) => {
      state.folders.searchQuery = ''
    },
    
    setSortBy: (state, action: PayloadAction<'name' | 'modified' | 'size'>) => {
      state.folders.sortBy = action.payload
    },
    
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.folders.sortOrder = action.payload
    },
    
    toggleSortOrder: (state) => {
      state.folders.sortOrder = state.folders.sortOrder === 'asc' ? 'desc' : 'asc'
    },
    
    // Selection actions
    selectItem: (state, action: PayloadAction<string>) => {
      if (!state.folders.selectedItems.includes(action.payload)) {
        state.folders.selectedItems.push(action.payload)
      }
    },
    
    deselectItem: (state, action: PayloadAction<string>) => {
      state.folders.selectedItems = state.folders.selectedItems.filter(
        (id) => id !== action.payload
      )
    },
    
    selectAll: (state, action: PayloadAction<string[]>) => {
      state.folders.selectedItems = action.payload
    },
    
    clearSelection: (state) => {
      state.folders.selectedItems = []
    },
    
    // Modal actions
    openCreateFolderModal: (state) => {
      state.modals.createFolder = true
    },
    
    closeCreateFolderModal: (state) => {
      state.modals.createFolder = false
    },
    
    openCreateDocumentModal: (state) => {
      state.modals.createDocument = true
    },
    
    closeCreateDocumentModal: (state) => {
      state.modals.createDocument = false
    },
    
    openDeleteConfirm: (state, action: PayloadAction<{ id: string; name: string; type: 'folder' | 'document' }>) => {
      state.modals.deleteConfirm = {
        isOpen: true,
        itemId: action.payload.id,
        itemName: action.payload.name,
        itemType: action.payload.type,
      }
    },
    
    closeDeleteConfirm: (state) => {
      state.modals.deleteConfirm = {
        isOpen: false,
        itemId: null,
        itemName: null,
        itemType: null,
      }
    },
    
    // Theme actions
    setThemeMode: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme.mode = action.payload
    },
    
    toggleTheme: (state) => {
      state.theme.mode = state.theme.mode === 'light' ? 'dark' : 'light'
    },
    
    // Sidebar actions
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebar.isCollapsed = action.payload
    },
    
    toggleSidebar: (state) => {
      state.sidebar.isCollapsed = !state.sidebar.isCollapsed
    },
  },
})

export const {
  setViewMode,
  setCurrentFolder,
  setSearchQuery,
  clearSearchQuery,
  setSortBy,
  setSortOrder,
  toggleSortOrder,
  selectItem,
  deselectItem,
  selectAll,
  clearSelection,
  openCreateFolderModal,
  closeCreateFolderModal,
  openCreateDocumentModal,
  closeCreateDocumentModal,
  openDeleteConfirm,
  closeDeleteConfirm,
  setThemeMode,
  toggleTheme,
  setSidebarCollapsed,
  toggleSidebar,
} = uiSlice.actions

export default uiSlice.reducer