import React, { useEffect, useState } from 'react'
import { withRouter } from 'react-router'
import { Alert } from 'antd'
import { useDispatch } from 'react-redux'
import { loginAction } from '../../redux/auth/authSlice'
import APIrequest from '../../services'
import modalNotification from '../../utilities/notifications'
import {
  setSessionStorageToken,
  tagClassToggle
} from '../../utilities/common'
import ApiEndPoints from '../../utilities/apiEndPoints'
import textMessages from '../../utilities/messages'
import LoginForm from '../forms/login'
import logger from '../../utilities/logger'
import ForgotPassword from '../forgotPassword'

const Login = () => {
  const dispatch = useDispatch()
  const [isSpin, setIsSpin] = useState(false)
  const [isAlert, setIsAlert] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const onFinish = async (values) => {
    setIsSpin(true)
    try {
      const payload = {
        ...ApiEndPoints.accountLogin,
        bodyData: {
          email: values.email,
          password: values.password,
          deviceType: 'web'
        }
      }
      const res = await APIrequest(payload)
      setIsSpin(false)
      setSessionStorageToken(res.data.token)
      modalNotification({
        type: 'success',
        message: 'Welcome back',
        description: res.message || textMessages.loginSuccessfully
      })
      dispatch(loginAction(res.data))
    } catch (error) {
      setIsAlert(true)
      setIsSpin(false)
      setErrorMsg(error.message)
      logger({ 'error:': error })
    }
  }

  const onFinishFailed = (errorInfo) => {
    logger({ 'Failed:': errorInfo })
  }

  useEffect(() => {
    tagClassToggle('body', 'login-body')
    return () => {
      tagClassToggle('body', 'login-body')
    }
  })

  return (
    <main className="login-page d-flex align-items-center justify-content-center">
      <div className="login-wrap position-relative">
        <div className="login common">
          <h3 className="title font-bd">Log In</h3>
          {isAlert && (
            <Alert
              message={errorMsg || textMessages.loginError}
              className='mb-4'
              type='error'
            />
          )}
          <LoginForm
            isSpin={isSpin}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            submitButtonText={'LOGIN'}
          />
        </div>
        <ForgotPassword />
      </div>
    </main>
  )
}

export default withRouter(Login)
