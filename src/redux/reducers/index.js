import customerReducer from "./customerSlice";
import accountReducer from "./accountSlice";
import { combineReducers } from "redux";
export default {
  customerReducer,
  accountReducer,
};
// export default (state, action) => {
//   return combineReducers({
//     customerReducer,
//   })({}, {});
// };
