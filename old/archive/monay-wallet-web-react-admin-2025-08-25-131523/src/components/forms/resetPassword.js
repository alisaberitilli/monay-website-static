import React from 'react'
import { Form, Input, Button } from 'antd'
import PropTypes from 'prop-types'
import { LoadingSpinner } from '../common'
import validation from '../../utilities/validation'

export default function ResetPasswordForm ({
  isSpin,
  onFinish,
  onFinishFailed,
  submitButtonText
}) {
  return (
    <Form
      name='resetPassword'
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <div className='form-group'>
        <Form.Item
          name='password'
          rules={validation.resetPassword.password}
        >
          <Input.Password
            className='form-control'
            placeholder='New Password'
          />
        </Form.Item>
      </div>
      <div className='form-group'>
        <Form.Item
          name='confirm'
          dependencies={['password']}
          rules={validation.resetPassword.confirm}
        >
          <Input.Password
            className='form-control'
            placeholder='Confirm Password'
          />
        </Form.Item>
      </div>
      <div className='text-center'>
        <Form.Item>
          <Button
            disabled={isSpin}
            htmlType='submit'
            className='btn btn-primary ripple-effect w-100'
          >
            {isSpin ? <LoadingSpinner /> : submitButtonText}
          </Button>
        </Form.Item>
      </div>
    </Form>
  )
}

ResetPasswordForm.propTypes = {
  isSpin: PropTypes.bool.isRequired,
  onFinish: PropTypes.func.isRequired,
  onFinishFailed: PropTypes.func.isRequired,
  submitButtonText: PropTypes.string.isRequired
}
