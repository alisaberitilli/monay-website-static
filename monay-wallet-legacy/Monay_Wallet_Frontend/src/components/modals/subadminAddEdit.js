import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from 'react-bootstrap'
import PropTypes from 'prop-types'
import APIrequest from '../../services'
import modalNotification from '../../utilities/notifications'
import ApiEndPoints from '../../utilities/apiEndPoints'
import textMessages from '../../utilities/messages'
import SubadminForm from '../forms/subadmin'
import logger from '../../utilities/logger'
import { selectUserData } from '../../redux/auth/authSlice'
import { useSelector } from 'react-redux'

export default function SubadminAddEdit(props) {
  const { t } = useTranslation()
  const [isSpin, setIsSpin] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isEditFormType, setIsEditFormType] = useState(Object.keys(props.data).length > 0)
  const userData = useSelector(selectUserData);
  useEffect(() => {
    const isEditFormType = Object.keys(props.data).length > 0
    setIsEditFormType(isEditFormType)
    setErrorMsg('')
    setIsSpin(false)
  }, [props.show, props.data])

  const onFinish = async values => {
    setIsSpin(true)
    setErrorMsg('')
    try {
      let updatePayload = {};
      let payload = {
        ...ApiEndPoints.addSubadmin,
        bodyData: {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          status: values.status,
          roleId: (values.roleId) ? values.roleId : '',
          phoneNumberCountryCode: values.phoneNumbeCountryCode,
          phoneNumber: values.phoneNumber

        }
      }
      if (isEditFormType) {
        updatePayload = {
          ...ApiEndPoints.editSubadmin,
          bodyData: {
            firstName: values.firstName,
            lastName: values.lastName,
            status: values.status,
            email: values.email,
            password: values.password,
            roleId: (values.roleId) ? values.roleId : '',
            id: props.data.id,
            phoneNumberCountryCode: values.phoneNumbeCountryCode,
            phoneNumber: values.phoneNumber
          }
        }
      }

      const res = await APIrequest((isEditFormType) ? updatePayload : payload)
      setIsSpin(false)
      modalNotification({
        type: 'success',
        message: 'Success',
        description: res.message || (isEditFormType ? textMessages.updateApproverMessage : textMessages.addApproverMessage)
      })
      props.onSubmitSuccess()
      props.onHide()
    } catch (error) {
      setIsSpin(false)
      setErrorMsg(error.message)
      logger({ 'error:': error })
    }
  }

  const onFinishFailed = errorInfo => {
    logger({ 'Failed:': errorInfo })
  }

  if (!props.show) {
    return <></>
  }

  return (
    <Modal
      show={props.show}
      onHide={props.onHide}
      size='sm'
      aria-labelledby='contained-modal-title-vcenter'
      centered
    >
      <Modal.Header>
        <Modal.Title id='contained-modal-title-vcenter'>
          <h2>{isEditFormType ? t('subadmin.edit') : t('subadmin.add')}</h2>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <SubadminForm
          onHide={props.onHide}
          isSpin={isSpin}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          initialValues={isEditFormType ? {
            firstName: props.data.firstName,
            lastName: props.data.lastName,
            email: props.data.email,
            password: props.data.password,
            status: props.data.status,
            roleId: props.data.roleId,
            phoneNumbeCountryCode: (props.data.phoneNumbeCountryCode) ? props.data.phoneNumbeCountryCode : userData.countryPhoneCode,
            phoneNumber: props.data.phoneNumber
          } : {
            firstName: '',
            lastName: '',
            status: 'active',
            email: '',
            password: '',
            userType: '',
            roleId: '',
            phoneNumbeCountryCode: userData.countryPhoneCode,
            phoneNumber: ''
          }}
          submitButtonText={isEditFormType ? t('common.update') : t('common.save')}
          errorMsg={errorMsg}
          isEdit={isEditFormType ? true : false}
        />
      </Modal.Body>
    </Modal>
  )
}

SubadminAddEdit.propTypes = {
  data: PropTypes.object.isRequired,
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onSubmitSuccess: PropTypes.func.isRequired
}
