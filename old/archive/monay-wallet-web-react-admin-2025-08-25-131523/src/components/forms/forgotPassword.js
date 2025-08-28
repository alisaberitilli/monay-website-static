import React from 'react'
import { Form, Input, Button } from 'antd'
import PropTypes from 'prop-types'
import { LoadingSpinner } from '../common'
import validation from '../../utilities/validation'

export default function ForgotPasswordForm ({
  isSpin,
  onFinish,
  onFinishFailed,
  submitButtonText
}) {
  return (
    <Form
      name='forgotPassword'
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <div className='form-group'>
        <Form.Item
          name='email'
          rules={validation.forgotPassword.email}
        >
          <Input className='form-control' placeholder='Email' />
        </Form.Item>
      </div>
      <div className='text-center'>
        <Form.Item>
          <Button
            disabled={isSpin}
            htmlType='submit'
            className='btn btn-primary ripple-effect min-w130'
          >
            {isSpin ? <LoadingSpinner /> : submitButtonText}
          </Button>
        </Form.Item>
      </div>
    </Form>
  )
}

ForgotPasswordForm.propTypes = {
  isSpin: PropTypes.bool.isRequired,
  onFinish: PropTypes.func.isRequired,
  onFinishFailed: PropTypes.func.isRequired,
  submitButtonText: PropTypes.string.isRequired
}
