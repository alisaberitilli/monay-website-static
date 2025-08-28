import React from 'react'
import { useTranslation } from 'react-i18next'
import { Form, Input, Button } from 'antd'
import PropTypes from 'prop-types'
import { LoadingSpinner } from '../common'
import validation from '../../utilities/validation'

export default function FaqForm ({
  isSpin,
  form,
  onFinish,
  onFinishFailed,
  goBack,
  submitButtonText
}) {
  const { t } = useTranslation()
  return (
    <Form
      name='addfaq'
      form={form}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <div className='form-group'>
        <label>{t('common.question')}</label>
        <Form.Item
          name='question'
          rules={validation.faq.question}
        >
          <Input className='form-control' placeholder={t('common.question')} />
        </Form.Item>
      </div>
      <div className='form-group'>
        <label>{t('common.answer')}</label>
        <Form.Item
          name='answer'
          rules={validation.faq.answer}
        >
          <Input.TextArea
            rows={8}
            className='form-control'
            placeholder={t('common.answer')}
          />
        </Form.Item>
      </div>
      <div className='form-group text-center mb-0'>
        <Form.Item>
          <div className='btn-row text-center'>
            <Button
              disabled={isSpin}
              type='primary'
              htmlType='submit'
              className='btn btn-primary width-120 ripple-effect text-uppercase mr-3'
            >
              {isSpin ? <LoadingSpinner /> : submitButtonText}
            </Button>
            <Button
              htmlType='button'
              className='btn btn-outline-dark width-120 ripple-effect text-uppercase '
              onClick={goBack}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </Form.Item>
      </div>
    </Form>
  )
}

FaqForm.propTypes = {
  form: PropTypes.any.isRequired,
  goBack: PropTypes.any.isRequired,
  isSpin: PropTypes.bool.isRequired,
  onFinish: PropTypes.func.isRequired,
  onFinishFailed: PropTypes.func.isRequired,
  submitButtonText: PropTypes.string.isRequired
}
