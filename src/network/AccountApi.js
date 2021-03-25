import { ApiClient } from "./Api";

export const accountApi = {
  list: (payload) => ApiClient.get("/list", payload),
  login: (payload) => ApiClient.post("/login/LoginWeb", payload),
};

export const createUser = (payload) => ApiClient.post("/User/Add", payload);
export const userDetail = (payload) => ApiClient.get("/User/Detail", payload);
export const resetPassword = (payload) =>
  ApiClient.post("/User/ResetPassword", payload);
export const updateUser = (payload) => ApiClient.post("/User/Update", payload);
export const userList = (payload) => ApiClient.get("/User/Search", payload);
export const deleteUser = (payload) => ApiClient.post("/User/Delete", payload);
export const changePassword = (payload) =>
  ApiClient.post("/User/ChangePassword", payload);

// users/login
// login/LoginWeb
