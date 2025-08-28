import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Form } from 'antd'
// import PropTypes from 'prop-types'
import APIrequest from '../../services'
import modalNotification from '../../utilities/notifications'
import ApiEndPoints from '../../utilities/apiEndPoints'
import textMessages from '../../utilities/messages'
import ChangePasswordForm from '../forms/changePassword'
import logger from '../../utilities/logger'
import BreadCrumb from '../breadCrumb'

export default function ChangePassword() {
  const [form] = Form.useForm();
  const { t } = useTranslation()
  const [isSpin, setIsSpin] = useState(false)
  const [isAlert, setIsAlert] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const onFinish = async (values) => {
    setIsSpin(true)
    try {
      const payload = {
        ...ApiEndPoints.accountChangePassword,
        bodyData: {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
          confirmNewPassword: values.confirmNewPassword
        }
      }
      setIsAlert(false)
      const res = await APIrequest(payload)
      modalNotification({
        type: 'success',
        message: 'Success',
        description: res.message || textMessages.passwordChangeSuccess
      })
      form.resetFields();
      setIsSpin(false)
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

  return (
    <main className="main-content add-page">
      <div className="container-fluid">

        <div className="page-title-row">
          <div className='left-side'>
            <BreadCrumb
              bredcrumbs={[
                {
                  name: t('dashboard.title'),
                  path: '/'
                },
                {
                  name: 'Change Password'
                }
              ]}
            />
            <h2 className='page-title text-capitalize mb-0'>
              {'Change Password'}
            </h2>
          </div>
          <div className='right-side'>
          </div>
        </div>

        <div className="card cardSmall">
          <div className="card-body">
            {isAlert && (
              <Alert
                message={errorMsg || textMessages.currentPasswordError}
                className='mb-4'
                type='error'
              />
            )}
            <ChangePasswordForm
              form={form}
              isSpin={isSpin}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              submitButtonText={t('common.update')}
            />
          </div>
        </div>
      </div>
    </main>
  )
}

ChangePassword.propTypes = {}
