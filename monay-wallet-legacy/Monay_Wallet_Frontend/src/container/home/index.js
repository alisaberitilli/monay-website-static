import React, { PureComponent } from 'react'
import MetaTags from '../../utilities/metaTags'
import Login from '../../components/login'
import config from '../../config'
import { withTranslation } from 'react-i18next'
import PropTypes from 'prop-types'
class Home extends PureComponent {
  render() {
    const { t } = this.props
    return (
      <>
        <MetaTags
          title={`${config.NAME_TITLE} | ${t('login.title')}`}
          description={`${t('login.title')} page of ${config.NAME_TITLE}`}
        />
        <Login />
      </>
    )
  }
}

Home.propTypes = {
  t: PropTypes.func.isRequired
}

export default withTranslation()(Home)
