import React, { useState }  from 'react'
import APIrequest from '../../services'
import modalNotification from '../../utilities/notifications'
import { Alert } from 'antd'
import ApiEndPoints from '../../utilities/apiEndPoints'
import textMessages from '../../utilities/messages'
import ForgotPasswordForm from '../forms/forgotPassword'
import logger from '../../utilities/logger'
import { classToggleOfLoginAndForgot } from '../../utilities/common'

const ForgotPassword = () => {
  const [isSpin, setIsSpin] = useState(false)
  const [isAlert, setIsAlert] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')


  const onFinish = async (values) => {
    setIsSpin(true)
    try {
      const payload = {
        ...ApiEndPoints.accountForgotPassword,
        bodyData: {
          email: values.email
        }
      }
      const res = await APIrequest(payload)
      modalNotification({
        type: 'success',
        message: 'Sent',
        description: res.message || 'Link successfully sent to your mail !'
      })
      setIsSpin(false)
      classToggleOfLoginAndForgot('forgot')
    } catch (error) {
      setIsAlert(true)
      setIsSpin(false)
      setErrorMsg(error.message)
      logger({ 'error:': error })
    }
  };

  const onFinishFailed = (errorInfo) => {
    logger({ 'Failed:': errorInfo })
  };

    return (
      <>
        <div className="common forgot_password">
          <h6 className="title font-bd">Forgot Password</h6>
          {isAlert && (
            <Alert
              message={errorMsg || textMessages.enterValidEmail}
              className='mb-4'
              type='error'
            />
          )}
          <ForgotPasswordForm
            isSpin={isSpin}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            submitButtonText={'SEND ME A LINK'}
          />
        </div>            
      </>
    )
}

export default ForgotPassword