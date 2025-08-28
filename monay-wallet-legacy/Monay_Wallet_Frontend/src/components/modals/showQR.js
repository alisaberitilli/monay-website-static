import React from 'react'
import { Modal } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { Button } from 'antd'
import { useTranslation } from 'react-i18next'

export default function ShowQR(props) {
  const { t } = useTranslation()

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
      id='qrmodal'
    >
      <Modal.Header className="text-center justify-content-center">
        <Modal.Title id='contained-modal-title-vcenter'>
          <h2 className='modal-title font-libre-bold w-100 text-capitalize'>{props.data.title}</h2>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className='text-center'>
        <img src={props.data.img} alt="Qr-code" className="img-fluid" />
        <div className='btn-row text-center mt-3'>
          <Button
            htmlType='button'
            className='btn btn-light ripple-effect-dark text-uppercase'
            onClick={() => {
              props.onHide()
            }}
          >
            {t('common.back')}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  )
}

ShowQR.propTypes = {
  data: PropTypes.object.isRequired,
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired
}
