import React, { PureComponent } from 'react'
import MetaTags from '../../utilities/metaTags'
import config from '../../config'
import EditProfileComponent from '../../components/editProfile'
import { withTranslation } from 'react-i18next'
import PropTypes from 'prop-types'

class EditProfile extends PureComponent {
  render() {
    const { t } = this.props
    return (
      <>
        <MetaTags
          title={`${config.NAME_TITLE} | ${t('editProfile.title')}`}
          description={`${t('editProfile.title')} page of ${config.NAME_TITLE}`}
        />
        <EditProfileComponent />
      </>
    )
  }
}

EditProfile.propTypes = {
  t: PropTypes.func.isRequired
}

export default withTranslation()(EditProfile)