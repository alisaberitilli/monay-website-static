import React from 'react'
import { Route } from 'react-router-dom'
import PropTypes from 'prop-types'

const RouteWithLayout = props => {
  const { layout: Layout, component: PureComponent, ...rest } = props

  return (
    <Route
      {...rest}
      render={matchProps => (
        <Layout>
          <PureComponent {...matchProps} />
        </Layout>
      )}
    />
  )
}

RouteWithLayout.propTypes = {
  layout: PropTypes.any.isRequired,
  component: PropTypes.any.isRequired
}

export default RouteWithLayout
