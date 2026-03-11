import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import persistConfig from "./persisitConfig";
import goDataReducer from "./reducers/godata-reducer";

const combinedReducers = combineReducers({ goData: goDataReducer });

const persistedReducer = persistReducer(persistConfig, combinedReducers);
const middleware = (getDefaultMiddleware) =>
  getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: ["persist/PERSIST"],
    },
  });
export const store = configureStore({
  reducer: persistedReducer,
  middleware,
});
export const persistor = persistStore(store);
