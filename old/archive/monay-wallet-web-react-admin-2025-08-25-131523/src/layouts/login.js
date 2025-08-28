import React from 'react'
import PropTypes from 'prop-types'

const LoginLayout = (props) => {
  const { children } = props

  return (
    <>
      {children}
    </>
  )
}

LoginLayout.propTypes = {
  children: PropTypes.any.isRequired
}

export default LoginLayout
