import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import uiSlice from './slices/uiSlice'
import { api } from './api/api'
import { baseApi } from './api/baseApi'
import './api/preferencesApi' // Import to ensure the endpoints are injected

const persistConfig = {
  key: 'root',
  version: 1, // Increment to reset persisted state after ULID migration
  storage,
  whitelist: ['ui'], // Only persist UI state
  blacklist: [api.reducerPath, baseApi.reducerPath] // Don't persist API cache

}

const rootReducer = combineReducers({
  ui: uiSlice,
  [api.reducerPath]: api.reducer,
  [baseApi.reducerPath]: baseApi.reducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
    .concat(api.middleware)
    .concat(baseApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch