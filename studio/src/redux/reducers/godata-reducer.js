import { createSlice } from "@reduxjs/toolkit";

const initialState = null;

const slice = createSlice({
  name: "go_cache",
  initialState,
  reducers: {
    clearCache: (state) => {
      state = null;
      return state;
    },

    updateCache: (state, action) => {
      state = action.payload;
      return state;
    },
  },
});
export const { clearCache, updateCache } = slice.actions;
export const getCache = (state) => state?.goData;
export default slice.reducer;
