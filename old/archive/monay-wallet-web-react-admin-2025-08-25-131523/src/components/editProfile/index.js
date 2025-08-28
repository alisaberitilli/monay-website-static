import React, { useEffect, useState } from 'react'
import { withRouter } from 'react-router'
import { Alert, Form } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { selectUserData, updateUserDataAction } from '../../redux/auth/authSlice'
import APIrequest from '../../services'
import modalNotification from '../../utilities/notifications'
import ApiEndPoints from '../../utilities/apiEndPoints'
import textMessages from '../../utilities/messages'
import logger from '../../utilities/logger'
import BreadCrumb from '../breadCrumb'
import EditProfileForm from '../forms/editProfile'

const EditProfileComponent = () => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const dispatch = useDispatch()
  const [isSpin, setIsSpin] = useState(false)
  const [isAlert, setIsAlert] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const userData = useSelector(selectUserData);

  useEffect(() => {
    const isEditFormType = Object.keys(userData).length > 0
    if (isEditFormType) {
      form.setFieldsValue({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        icon: userData.profilePicture,
        phoneNumbeCountryCode: (userData.phoneNumbeCountryCode) ? userData.phoneNumbeCountryCode : userData.countryPhoneCode,
        phoneNumber: userData.phoneNumber
      })
    } else {
      form.setFieldsValue({
        firstName: '',
        lastName: '',
        email: '',
        icon: '',
        phoneNumbeCountryCode: '',
        phoneNumber: ''
      })
    }
  }, [userData]) // eslint-disable-line react-hooks/exhaustive-deps

  const onFinish = async (values) => {
    setIsSpin(true)
    try {
      const payload = {
        ...ApiEndPoints.accountUpdate,
        bodyData: {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          profilePicture: values.icon,
          phoneNumberCountryCode: values.phoneNumbeCountryCode,
          phoneNumber: values.phoneNumber
        }
      }
      const res = await APIrequest(payload)
      setIsSpin(false)
      modalNotification({
        type: 'success',
        message: 'success',
        description: res.message || textMessages.profileSuccessfully
      })
      if ("profilePictureUrl" in res.data) {
        payload.bodyData.profilePictureUrl = res.data.profilePictureUrl;
      }
      // if (payload.bodyData.profilePicture) {
      //   payload.bodyData.profilePictureUrl = `${userData.profilePictureUrl.split('public/')[0]}${payload.bodyData.profilePicture}`
      // }
      dispatch(updateUserDataAction(payload.bodyData))
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

  const onFileUploaded = (icon) => {
    form.setFieldsValue({
      icon
    })
  }

  const onFileRemoved = () => {
    form.setFieldsValue({
      icon: ''
    })
  }

  return (
    <main className="main-content add-page">
      <div className="container-fluid">

        <div className="page-title-row">
          <div className="left-side">
            <BreadCrumb
              bredcrumbs={[
                {
                  name: t('dashboard.title'),
                  path: '/'
                },
                {
                  name: t('editProfile.title')
                }
              ]}
            />
            <h2 className='page-title text-capitalize mb-0'>
              {t('editProfile.title')}
            </h2>
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
            <EditProfileForm
              form={form}
              isSpin={isSpin}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              onFileUploaded={onFileUploaded}
              onFileRemoved={onFileRemoved}
              submitButtonText={t('common.update')}
              media={[userData.profilePictureUrl]}
            />
          </div>
        </div>

      </div>
    </main>
  )
}

export default withRouter(EditProfileComponent)
