import React, { PureComponent } from 'react'
import MetaTags from '../../utilities/metaTags'
import config from '../../config'
import ChangePassword from '../../components/changePassword'

export default class ChangePasswordRoute extends PureComponent {
  render() {
    return (
      <>
        <MetaTags
          title={`${config.NAME_TITLE} | Change Password`}
          description={`Change Password page of ${config.NAME_TITLE}`}
        />
        <ChangePassword />
      </>
    )
  }
}
