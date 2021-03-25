import { ApiClient } from "./Api";

export const createConfig = (payload) =>
  ApiClient.post("/config/Update", payload);
export const configDetail = (payload) =>
  ApiClient.get("/config/Detail", payload);
