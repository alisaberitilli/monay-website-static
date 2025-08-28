import axios from 'axios'
import modalNotification from '../utilities/notifications'
import {
  getSessionStorageToken,
  removeSessionStorageToken,
  getLocalStorageLanguage
} from '../utilities/common'
import config from '../config'
import momentTimezone from 'moment-timezone'
import logger from '../utilities/logger'

const APIrequest = async ({
  method,
  url,
  baseURL,
  queryParams,
  bodyData,
  cancelFunction,
  formHeaders,
  removeHeaders
}) => {
  const apiToken = getSessionStorageToken()
  const language = getLocalStorageLanguage()

  try {
    const axiosConfig = {
      method: method || 'GET',
      baseURL: config.API_BASE_URL,
      headers: {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'X-Frame-Options': 'sameorigin',
        timezone: momentTimezone.tz.guess(true),
        language
      }
    }

    if (formHeaders) {
      axiosConfig.headers = Object.assign({}, axiosConfig.headers, formHeaders)
    }

    if (baseURL) {
      axiosConfig.baseURL = baseURL
    }

    if (url) {
      axiosConfig.url = url
    }

    if (queryParams) {
      const queryParamsPayload = {}
      for (const key in queryParams) {
        if (Object.hasOwnProperty.call(queryParams, key)) {
          let element = queryParams[key]
          if (typeof element === 'string') {
            element = element.trim()
          }
          if (!['', null, undefined, NaN].includes(element)) {
            queryParamsPayload[key] = element
          }
        }
      }
      axiosConfig.params = queryParamsPayload
    }

    if (bodyData) {
      const bodyPayload = {}
      for (const key in bodyData) {
        if (Object.hasOwnProperty.call(bodyData, key)) {
          let element = bodyData[key]
          if (typeof element === 'string') {
            element = element.trim()
          }
          if (!['', null, undefined, NaN].includes(element)) {
            bodyPayload[key] = element
          }
        }
      }
      axiosConfig.data = bodyPayload
    }

    if (cancelFunction) {
      axiosConfig.cancelToken = new axios.CancelToken((cancel) => {
        cancelFunction(cancel)
      })
    }

    if (removeHeaders) {
      delete axiosConfig.headers
    }

    if (apiToken) {
      axiosConfig.headers = {
        ...axiosConfig.headers,
        Authorization: `Bearer ${apiToken}`
      }
    }

    logger({ axiosConfig })

    const res = await axios(axiosConfig)
    return res.data
  } catch (error) {
    if (axios.isCancel(error)) {

      logger('API canceled', error)
      throw new Error(error)
    } else {
      const errorRes = error.response
      logger('Error in the api request', errorRes)
      if (errorRes.data.message) {
        // alert(errorRes.data.error.status)
        modalNotification({
          type: 'error',
          message: 'Error',
          description: errorRes.data.message
        })
        // if ([401].includes(errorRes.data.error.status)) {
        //   removeSessionStorageToken()

        // }
      } else {
        modalNotification({
          type: 'error',
          message: 'Error',
          description: errorRes.data.error[0].message
        })
      }
      if (
        'error' in errorRes.data &&
        Object.keys(errorRes.data.error).length &&
        [400, 401].includes(errorRes.data.error.status)
      ) {
        removeSessionStorageToken()
      }
      if (errorRes.data.message) {
        throw new Error(errorRes.data.message)
      } else {
        throw new Error(errorRes.data.error[0].message)
      }
    }
  }
}

export default APIrequest
