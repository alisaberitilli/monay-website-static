import React, { useState } from 'react'
import { Modal } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import APIrequest from '../../services'
import modalNotification from '../../utilities/notifications'
import ApiEndPoints from '../../utilities/apiEndPoints'
import ReplyMessageForm from '../forms/replyMessage'
import logger from '../../utilities/logger'

export default function ReplyMessage(props) {
  const { t } = useTranslation()
  const [isSpin, setIsSpin] = useState(false)

  const onFinish = async values => {
    setIsSpin(true)
    try {
      const payload = {
        ...ApiEndPoints.updateRequest(props.data.id),
        bodyData: {
          response: values.response
        }
      }
      const res = await APIrequest(payload)
      modalNotification({
        type: 'success',
        message: 'Success',
        description: res.message || 'You replied to message successful!'
      })
      setIsSpin(false)
      props.onHide()
      props.onSubmitSuccess()
    } catch (error) {
      setIsSpin(false)
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
      className='modal-dialog-scrollable'
      centered
    >
      <Modal.Header>
        <Modal.Title id='contained-modal-title-vcenter'>
          <h4 className="modal-title font-libre-bold w-100 text-center">{t('common.sendMail')}</h4>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ReplyMessageForm
          data={props.data}
          isSpin={isSpin}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          submitButtonText={t('common.send')}
          closeModal={() => props.onHide()}
        />
      </Modal.Body>
    </Modal>
  )
}

ReplyMessage.propTypes = {
  data: PropTypes.object.isRequired,
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onSubmitSuccess: PropTypes.func.isRequired
}
