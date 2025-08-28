import React from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'

export default function MetaTags ({ title, description }) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name='description' content={description} />
      <link rel='canonical' href={window.location.href} />
    </Helmet>
  )
}

MetaTags.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired
}
