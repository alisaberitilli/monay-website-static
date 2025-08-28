import React, { PureComponent } from 'react'
import MetaTags from '../../utilities/metaTags'
import NotFoundView from '../../components/notFoundView'
import config from '../../config'

export default class NotFound extends PureComponent {
  render () {
    return (
      <>
        <MetaTags
          title={`${config.NAME_TITLE} | Page Not Found`}
          description={`Page Not Found of ${config.NAME_TITLE}`}
        />
        <NotFoundView />
      </>
    )
  }
}
