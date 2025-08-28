import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import APIrequest from '../../services'
import { Alert } from 'antd'
import modalNotification from '../../utilities/notifications'
import ApiEndPoints from '../../utilities/apiEndPoints'
import { tagClassToggle } from '../../utilities/common'
import textMessages from '../../utilities/messages'
import ResetPasswordForm from '../../components/forms/resetPassword'
import logger from '../../utilities/logger'
import MetaTags from '../../utilities/metaTags'
import config from '../../config'

class ResetPassword extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      isSpin: false,
      isAlert: false,
      errorMsg: ''
    }
  }

  componentDidMount() {
    tagClassToggle('body', 'login-body')
  }

  componentWillUnmount() {
    tagClassToggle('body', 'login-body')
  }

  onFinish = async (values) => {
    try {
      const payload = {
        ...ApiEndPoints.accountResetPassword,
        bodyData: {
          token: this.props.match.params.token,
          newPassword: values.password,
          confirmPassword: values.confirm
        }
      }
      this.setState({ isSpin: true, isAlert: false })
      const res = await APIrequest(payload)
      modalNotification({
        type: 'success',
        message: 'Success',
        description: res.message || textMessages.passwordSuccess
      })
      this.props.history.push({
        pathname: '/'
      })
    } catch (error) {
      this.setState({ isAlert: true, isSpin: false, errorMsg: error.message })
      logger({ 'error:': error })
    }
  };

  onFinishFailed = (errorInfo) => {
    logger({ 'Failed:': errorInfo })
  };

  render() {
    const { isSpin, isAlert, errorMsg } = this.state
    return (
      <>
        <MetaTags
          title={`${config.NAME_TITLE} | Reset Password`}
          description={`Reset Password page of ${config.NAME_TITLE}`}
        />
        <main className="login-page d-flex align-items-center justify-content-center">
          <div className="login-wrap position-relative">
            <div className="login common">
              <h3 className="title font-bd">Reset Password</h3>
              {isAlert && (
                <Alert
                  message={errorMsg || textMessages.enterPassword}
                  className='mb-4'
                  type='error'
                />
              )}
              <ResetPasswordForm
                isSpin={isSpin}
                onFinish={this.onFinish}
                onFinishFailed={this.onFinishFailed}
                submitButtonText={'RESET PASSWORD'}
              />
            </div>
          </div>
        </main>
      </>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    ...state
  }
}

ResetPassword.propTypes = {
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
}

export default connect(mapStateToProps, null)(ResetPassword)
