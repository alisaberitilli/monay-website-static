import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from 'react-bootstrap'
import { Button } from 'antd'
import PropTypes from 'prop-types'
import ApiEndPoints from '../../utilities/apiEndPoints'
import APIrequest from '../../services'
import modalNotification from '../../utilities/notifications'
import textMessages from '../../utilities/messages'
import { LoadingSpinner } from '../common'
import logger from '../../utilities/logger'

export default function DeleteConfirmation (props) {
  const { t } = useTranslation()
  const [isSpin, setIsSpin] = useState(false)

  const deleteConfirmation = async () => {
    setIsSpin(true)
    try {
      let payload = {}
      let message = ''
      if (props.type === 'faq') {
        payload = {
          ...ApiEndPoints.deleteSpecificFaq(props.id)
        }
        message = textMessages.deleteFAQ
      } else if (props.type === 'interval') {
        payload = {
          ...ApiEndPoints.deleteSpecificInterval(props.id)
        }
        message = textMessages.deleteInterval
      } else {
        return false
      }

      const res = await APIrequest(payload)

      setIsSpin(false)
      modalNotification({
        type: 'success',
        message: 'Success',
        description: res.message || message
      })
      props.onSubmitSuccess()
      props.onHide()
    } catch (error) {
      setIsSpin(false)
      logger({ 'error:': error })
    }
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
      <Modal.Header className="justify-content-center text-center">
        <Modal.Title id='contained-modal-title-vcenter'>
          <h2 className="modal-title faqheading font-libre-bold w-100 text-capitalize">{t('common.deleteConfirmation')}</h2>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center p-20">
        <div className="btn-row">
          <Button
            disabled={isSpin}
            className='btn btn-primary width-120 ripple-effect text-uppercase'
            onClick={deleteConfirmation}
          >
            {isSpin ? <LoadingSpinner /> : t('common.yes')}
          </Button>
          <Button
            className='btn btn-outline-dark width-120 ripple-effect text-uppercase ml-3 '
            onClick={props.onHide}
          >
            {t('common.no')}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  )
}

DeleteConfirmation.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
  onSubmitSuccess: PropTypes.func.isRequired
}
