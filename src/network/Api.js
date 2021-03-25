import axios from "axios";
import Cookie from "js-cookie";
import queryString from "query-string";
import { notifyFail } from "utils/notify";
import { STRING } from "constants/Constant";

// const Reactotron =
//   process.env.NODE_ENV !== "production" &&
//   require("reactotron-react-js").default;

function createAxios() {
  var axiosInstant = axios.create();
  axiosInstant.defaults.baseURL = "http://qldh.winds.vn:6886/api";
  // "http://qldh.winds.vn:6886/api";
  // http://utruckdev.winds.vn:8668
  // http://qldh.winds.vn/api
  // http://qldh.winds.vn:6886/api
  axiosInstant.defaults.timeout = 20000;
  axiosInstant.defaults.headers = { "Content-Type": "application/json" };
  axiosInstant.defaults.headers = { "Access-Control-Allow-Origin": "*" };

  axiosInstant.interceptors.request.use(
    async (config) => {
      config.headers.token = Cookie.get("SESSION_ID");
      // Cookie.get('SESSION_ID')
      return config;
    },
    (error) => Promise.reject(error)
  );

  axiosInstant.interceptors.response.use(
    (response) => {
      // log via ReactOtron
      if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
        // Reactotron.apisauce(response);
      } else {
        // production code
      }
      // if (!navigator.onLine) {
      // notifyFail(response.data.message);
      // }
      if (response.data.code === 403) {
        Cookie.remove("SESSION_ID");
        window.location.reload();
      } else if (response.data.status !== 1)
        setTimeout(() => {
          notifyFail(response.data.message);
        }, 300);
      return response;
    },
    (error) => {}
  );
  return axiosInstant;
}

export const axiosClient = createAxios();

/* Support function */
function handleResult(api) {
  return api.then((res) => {
    if (!res) {
      notifyFail("Không có kết nối internet!");
      return;
    }
    // alert(JSON.stringify(res.data));
    if (res.data.status !== 1) {
      if (res.data.code === 403) {
        Cookie.remove("SESSION_ID");
        alert("Phiên đăng nhập hết hạn. \n \
        签名版本已过期.");
      }
      return Promise.reject(res.data);
    }
    return Promise.resolve(res.data);
  });
}
// handle url
function handleUrl(url, query) {
  return queryString.stringifyUrl({ url: url, query });
}

export const ApiClient = {
  get: (url, payload) => handleResult(axiosClient.get(handleUrl(url, payload))),
  post: (url, payload) => handleResult(axiosClient.post(url, payload)),
  // post: (url, payload) => axios.post("http://qldh.winds.vn/api" + url, payload),
  put: (url, payload) => handleResult(axiosClient.put(url, payload)),
  path: (url, payload) => handleResult(axiosClient.patch(url, payload)),
  delete: (url, payload) => handleResult(axiosClient.delete(url, payload)),
};
