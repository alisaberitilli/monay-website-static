import axios from "axios";
import config from "../config";
import loggers from '../services/logger';
import utility from '../services/utility';

const httpMethod = {
  GET: "get",
  POST: "post",
  PUT: "put",
  OPTIONS: "options",
  DELETE: "delete",
};

const axiosInstance = axios.create();

const ApiRequest = {
  headers: {
    "content-type": "application/json",
  },

  setHeaders(data) { },
  /**
   *
   * @returns
   */
  getHeaders() {
    return this.headers;
  },

  /**
   * Send get request
   * @param {string} url
   * @param {object} options
   * @returns
   */
  async getRequest(url, options, currency) {
    try {
      return await this.sendRequest(url, httpMethod.GET, currency, options);
    } catch (err) {      
      loggers.paymentErrorLogger.error(`Get request ${err}, data: ${utility.jsonStringify(options)}, currency: ${currency}, url: ${url}`);
      throw err;
    }
  },

  /**
   * Send post request
   * @param {string} url
   * @param {object} options
   * @returns
   */
  async postRequest(url, options, currency) {
    try {
      return await this.sendRequest(url, httpMethod.POST, currency, options);
    } catch (err) {      
      loggers.paymentErrorLogger.error(`Post request ${err}, data: ${utility.jsonStringify(options)}, currency: ${currency}, url: ${url}`);
      throw err;
    }
  },

  /**
   * Send put request
   * @param {string} url
   * @param {object} options
   * @returns
   */
  async putRequest(url, data, currency) {
    try {
      return await this.sendRequest(url, httpMethod.PUT, currency, options);
    } catch (err) {      
      loggers.paymentErrorLogger.error(`Put request ${err}, data: ${utility.jsonStringify(data)}, currency: ${currency}, url: ${url}`);
      throw err;
    }
  },

  /**
   * Send delete request
   * @param {string} url
   * @param {object} options
   * @returns
   */
  async deleteRequest(url, options, currency) {
    try {
      return await this.sendRequest(url, httpMethod.DELETE, currency, options);
    } catch (err) {
      loggers.paymentErrorLogger.error(`Delete request ${err}, data: ${utility.jsonStringify(options)}, currency: ${currency}, url: ${url}`);
      throw err;
    }
  },

  /**
   * Send http request
   * @param {string} url
   * @param {string} method
   * @param {object} options
   * @returns
   */
  async sendRequest(url, method, currency, options = {}) {
    try {
     
      let configData = {
        baseURL:  config.payment[currency].apiUrl ,
        headers: { apiKey: options?.apiKey ?? '', secretKey: options?.secretKey ?? '', gpsToken:options?.headers?.gpsToken ?? ''   } ?? {},
        data: options.data ?? {},
        url,
        method,
      };
      return await axiosInstance.request(configData);
    } catch (err) {      
			loggers.paymentErrorLogger.error(`Axios service request ${err}, data: ${utility.jsonStringify(options)}, method: ${method}, currency: ${currency}, url: ${url}`);
      throw err;
    }
  },
};

export default ApiRequest;
