import { createStore, applyMiddleware } from "redux";
import { configureStore } from "@reduxjs/toolkit";
import reducers from "../reducers";
import thunk from "redux-thunk";

import customerReducer from "../reducers/customerSlice";
import { composeWithDevTools } from "redux-devtools-extension";
const composeEnhancers = composeWithDevTools({});

const store = configureStore(
  { reducer: reducers },
  composeEnhancers(applyMiddleware(thunk))
);

export default store;
