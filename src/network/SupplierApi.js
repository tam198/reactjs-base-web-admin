import { ApiClient } from "./Api";

export const createSupplier = (payload) =>
  ApiClient.post("/Provider/Create", payload);
export const supplierList = (payload) =>
  ApiClient.get("/Provider/Search", payload);
export const supplierDetail = (payload) =>
  ApiClient.get("/Provider/Detail", payload);
export const updateSupplier = (payload) =>
  ApiClient.post("/Provider/Update", payload);
export const deleteSupplier = (payload) =>
  ApiClient.post("/Provider/Delete", payload);
