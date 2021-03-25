import { ApiClient } from "./Api";

export const createOrder = (payload) =>
  ApiClient.post("/Order/Create", payload);
export const orderList = (payload) => ApiClient.get("/Order/Search", payload);
export const orderDetail = (payload) => ApiClient.get("/Order/Detail", payload);
export const updateOrder = (payload) =>
  ApiClient.post("/Order/Update", payload);
export const deleteOrder = (payload) =>
  ApiClient.post("/Order/Delete", payload);
export const exportOrder = (payload) => ApiClient.get("/Order/Export", payload);
export const supplierFullList = (payload) =>
  ApiClient.get("/Order/GetProvider", payload);

export const uploadDocument = (payload) =>
  ApiClient.post("/OrderDocument/Upload", payload);
export const deleteDocument = (payload) =>
  ApiClient.post("/OrderDocument/DeleteFile", payload);
export const getMoneyUnit = (payload) =>
  ApiClient.get("/Order/getMoney", payload);
