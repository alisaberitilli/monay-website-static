import React from 'react'
import { useTranslation } from 'react-i18next'
import { Form, Input, Button } from 'antd'
import PropTypes from 'prop-types'
import { LoadingSpinner } from '../common'
import validation from '../../utilities/validation'

export default function ChangePasswordForm({
  form,
  isSpin,
  onFinish,
  onFinishFailed,
  submitButtonText
}) {
  const { t } = useTranslation()
  return (
    <Form
      name='changePassword'
      form={form}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <div className='form-group'>
        <label>{t('changePassword.currentPassword')}</label>
        <Form.Item
          name='currentPassword'
          rules={validation.changePassword.currentPassword}
        >
          <Input.Password
            className='form-control'
            placeholder={t('changePassword.currentPassword')}
          />
        </Form.Item>
      </div>
      <div className='form-group'>
        <label>{t('changePassword.newPassword')}</label>
        <Form.Item
          name='newPassword'
          rules={validation.changePassword.newPassword}
        >
          <Input.Password
            className='form-control'
            placeholder={t('changePassword.newPassword')}
          />
        </Form.Item>
      </div>
      <div className='form-group'>
        <label>{t('changePassword.confirmPassword')}</label>
        <Form.Item
          name='confirmNewPassword'
          rules={validation.changePassword.confirmNewPassword}
        >
          <Input.Password
            className='form-control'
            placeholder={t('changePassword.confirmPassword')}
          />
        </Form.Item>
      </div>
      <div className='btn-row text-center'>
        <Form.Item>
          <Button
            disabled={isSpin}
            htmlType='submit'
            className='btn btn-primary width-120 ripple-effect text-uppercase'
          >
            {isSpin ? <LoadingSpinner /> : submitButtonText}
          </Button>
        </Form.Item>
      </div>
    </Form>
  )
}

ChangePasswordForm.propTypes = {
  form: PropTypes.any.isRequired,
  isSpin: PropTypes.bool.isRequired,
  onFinish: PropTypes.func.isRequired,
  onFinishFailed: PropTypes.func.isRequired,
  submitButtonText: PropTypes.string.isRequired
}
