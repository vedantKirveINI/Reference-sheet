import { createSlice } from "@reduxjs/toolkit";

const initialState = null;

const slice = createSlice({
  name: "go_cache",
  initialState,
  reducers: {
    clearCache: () => null,
    updateCache: (state, action) => action.payload,
  },
});
export const { clearCache, updateCache } = slice.actions;
export const getCache = (state) => state?.goData;
export default slice.reducer;
