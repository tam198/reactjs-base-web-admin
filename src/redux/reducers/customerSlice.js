import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const increment = createAsyncThunk("counter/increment", async () => {
  return await new Promise((resolve, reject) =>
    setTimeout(() => {
      resolve({ data: Date.now() });
    }, 1000)
  );
});

const counterSlice = createSlice({
  name: "counter",
  initialState: {
    isLoading: false,
    data: null,
  },
  reducers: {},
  extraReducers: {
    // Add reducers for additional action types here, and handle loading state as needed
    [increment.pending]: (state, action) => {
      state.isLoading = true;
      return state;
    },
    [increment.rejected]: (state, action) => {
      state.isLoading = false;
      state.data = "Error";
      return state;
    },
    [increment.fulfilled]: (state, action) => {
      // Add user to the state array
      state.isLoading = false;
      state.data = action.payload;
      return state;
    },
  },
});

export const actions = counterSlice.actions;
export default counterSlice.reducer;
