import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import * as serviceWorker from './serviceWorker'
import store, { Persistor } from './store'
import config from './config'
import App from './App'
import FullPageLoader from './components/loadingView/fullPageLoader'
import './index.css'
import './utilities/i18n'

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={<FullPageLoader />} persistor={Persistor}>
      <App />
    </PersistGate>
  </Provider>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
if (config.NODE_ENV === 'production') {
  serviceWorker.register()
} else {
  serviceWorker.unregister()
}
