import React from 'react'
import { Form, Input, Button } from 'antd'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { LoadingSpinner } from '../common'
import validation from '../../utilities/validation'
import { classToggleOfLoginAndForgot } from '../../utilities/common'

export default function LoginForm ({
  isSpin,
  onFinish,
  onFinishFailed,
  submitButtonText
}) {
  return (
    <Form
      name='login'
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <div className='form-group'>
        <Form.Item
          name='email'
          rules={validation.login.email}
        >
          <Input className='form-control' placeholder='Email' />
        </Form.Item>
      </div>
      <div className='form-group'>
        <Form.Item
          name='password'
          rules={validation.login.password}
        >
          <Input.Password
            className='form-control'
            placeholder='Password'
          />
        </Form.Item>
      </div>
      <div className='form-group position-relative auth-link text-right'>
        <div className='forgotpassword'>
          <span>Forgot Password?</span>
          <Link
            to=''
            className='theme-color'
            onClick={(e) => {
              e.preventDefault()
              classToggleOfLoginAndForgot('login')
            }}
          >            
          </Link>
        </div>
      </div>
      <div className='form-group  text-center mb-0 pt-sm-3'>
        <Form.Item>
          <Button
            disabled={isSpin}
            type='primary'
            htmlType='submit'
            className='btn btn-primary text-uppercase min-w130 ripple-effect'
          >
            {isSpin ? <LoadingSpinner /> : submitButtonText}
          </Button>
        </Form.Item>
      </div>
    </Form>
  )
}

LoginForm.propTypes = {
  isSpin: PropTypes.bool.isRequired,
  onFinish: PropTypes.func.isRequired,
  onFinishFailed: PropTypes.func.isRequired,
  submitButtonText: PropTypes.string.isRequired
}
