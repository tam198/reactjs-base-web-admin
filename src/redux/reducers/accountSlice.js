import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { accountApi } from "network/AccountApi";

export const login = createAsyncThunk("account/list", async (payload) => {
  try {
    return await accountApi.login(payload);
    // alert(JSON.stringify(data));
  } catch (error) {
    return error;
  }

  //   return await new Promise((resolve, reject) =>
  //     setTimeout(() => {
  //       reject({ data: Date.now() });
  //     }, 1000)
  //   );
});

const counterSlice = createSlice({
  name: "account",
  initialState: {
    isError: null,
    isLoading: true,
    data: null,
  },
  reducers: {},
  extraReducers: {
    // Add reducers for additional action types here, and handle loading state as needed
    [login.pending]: (state, action) => {
      state.isLoading = true;
      return state;
    },
    [login.rejected]: (state, action) => {
      state.isLoading = false;
      state.isError = action.payload;
      return state;
    },
    [login.fulfilled]: (state, action) => {
      // Add list accounts to the state array
      state.isLoading = false;
      state.data = action.payload.data;
      return state;
    },
  },
});

export const actions = counterSlice.actions;
export default counterSlice.reducer;
