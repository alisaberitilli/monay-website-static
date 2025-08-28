import React from 'react'
import { Form, Input, Button } from 'antd'
import PropTypes from 'prop-types'
import { Editor } from '@tinymce/tinymce-react'
import { useTranslation } from 'react-i18next'
import { LoadingSpinner } from '../common'
import validation from '../../utilities/validation'

export default function CmsForm({
  formRef,
  isSpin,
  optionsData,
  onFinish,
  onFinishFailed,
  submitButtonText,
  editorRef,
  handleEditorChange,
  onReset
}) {
  const { t } = useTranslation()
  return (
    <Form
      name='termsCondition'
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      ref={formRef}
    >
      <div className='form-group'>
        <label>{t('common.title')}</label>
        <Form.Item
          name='title'
          rules={validation.cms.title}
        >
          <Input className='form-control' placeholder={t('common.title')} />
        </Form.Item>
      </div>
      <div className='form-group'>
        <label>{t('common.content')}</label>
        <Form.Item
          name='content'
          rules={validation.cms.content}
        >
          <>
            <Input.TextArea
              rows={7}
              hidden
              className='form-control'
              placeholder={t('common.content')}
            />
            <Editor
              initialValue={(optionsData.pageContent) ? `${optionsData.pageContent}` : ''}
              ref={editorRef} // https://github.com/tinymce/tinymce-react/issues/6#issuecomment-355018974
              init={{
                height: 500,
                menubar: true,
                plugins: [
                  'advlist autolink lists link image charmap print preview anchor',
                  'searchreplace visualblocks code fullscreen',
                  'insertdatetime media table paste code help wordcount'
                ],
                toolbar: 'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help'
              }}
              onEditorChange={handleEditorChange}
            />
          </>
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
              onClick={onReset}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </Form.Item>
      </div>
    </Form>
  )
}

CmsForm.propTypes = {
  formRef: PropTypes.any.isRequired,
  editorRef: PropTypes.any.isRequired,
  handleEditorChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  isSpin: PropTypes.bool.isRequired,
  onFinish: PropTypes.func.isRequired,
  onFinishFailed: PropTypes.func.isRequired,
  submitButtonText: PropTypes.string.isRequired,
  optionsData: PropTypes.object
}
