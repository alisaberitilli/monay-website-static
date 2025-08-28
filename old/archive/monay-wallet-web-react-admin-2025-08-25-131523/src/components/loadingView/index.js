import React from 'react'
import FullPageLoader from './fullPageLoader'

export default function LoadingView() {
  return (
    <main className="main-content">
      <div className="container-fluid">
        <FullPageLoader />
      </div>
    </main>
  )
}
