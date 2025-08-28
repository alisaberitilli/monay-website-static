import React from 'react'
import { GlobalLoader } from '../common'

export default function FullPageLoader() {
  return (
    <div className="detailPage d-flex align-items-center justify-content-center">
      <div className="beforeloadAppLoader Listpreloader">
        <img className="d-block mb-3" src="/assets/images/logo.png" alt="logo" />
        <GlobalLoader />
      </div>
    </div>
  )
}
