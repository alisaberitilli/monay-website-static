import React from 'react'
import { useTranslation } from 'react-i18next'
import { Form, Input, Button } from 'antd'
import PropTypes from 'prop-types'
import { LoadingSpinner } from '../common'
import validation from '../../utilities/validation'

export default function ReplyMessageForm({
  data,
  isSpin,
  onFinish,
  closeModal,
  onFinishFailed,
  submitButtonText
}) {
  const { t } = useTranslation()
  return (
    <Form
      name='replyMessage'
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <div className='d-flex align-item-center mb-2'>
        <label>To :  </label>
        <div className='ml-2'>
          <span className='theme-color d-block'>
            {
              data.User.name
            }
          </span>
          <span className='theme-color d-block'>
            {
              data.User.email
            }
          </span>
        </div>
      </div>
      <div className='form-group'>
        <Form.Item
          name='response'
          rules={validation.replyMessage.response}
        >
          <Input.TextArea
            rows={7}
            className='form-control'
            placeholder={t('common.message')}
          />
        </Form.Item>
      </div>
      <div className='btn-row text-center'>
        <Form.Item>
          <Button disabled={isSpin} htmlType='submit' className='btn btn-primary width-120 ripple-effect text-uppercase mr-2'>
            {isSpin ? <LoadingSpinner /> : submitButtonText}
          </Button>
          <Button
            htmlType='button'
            className='btn btn-light ripple-effect-dark text-uppercase'
            onClick={() => {
              closeModal()
            }}
          >
            {t('common.back')}
          </Button>
        </Form.Item>
      </div>
    </Form>
  )
}

ReplyMessageForm.propTypes = {
  data: PropTypes.object.isRequired,
  isSpin: PropTypes.bool.isRequired,
  onFinish: PropTypes.func.isRequired,
  onFinishFailed: PropTypes.func.isRequired,
  submitButtonText: PropTypes.string.isRequired,
  closeModal: PropTypes.func.isRequired
}
