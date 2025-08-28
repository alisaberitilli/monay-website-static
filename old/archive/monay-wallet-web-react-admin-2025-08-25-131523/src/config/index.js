const config = {
  NODE_ENV: process.env.NODE_ENV,
  NAME_KEY: process.env.REACT_APP_NAME_KEY || 'App',
  NAME_TITLE: process.env.REACT_APP_NAME_TITLE || 'app',
  DEFAULT_LANGUAGE: process.env.REACT_APP_DEFAULT_LANGUAGE || 'en',
  BASE_URL: process.env.REACT_APP_BASE_URL,
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL,
  BACKEND_BASE_URL: process.env.REACT_APP_BACKEND_BASE_URL,
  SOCKET_URL: process.env.REACT_APP_SOCKET_URL,
  IMAGE_UPLOAD_SIZE_LIMIT: Number(process.env.REACT_APP_IMAGE_UPLOAD_SIZE_LIMIT),
  CURRENCY_SYMBOL: '$'
}

export default config
