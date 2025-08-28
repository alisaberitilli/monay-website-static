import React from 'react'
import { Form, Input, Button } from 'antd'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { LoadingSpinner } from '../common'
import validation from '../../utilities/validation'
import UploadMedia from '../uploadMedia'
import ApiEndPoints from '../../utilities/apiEndPoints'

export default function EditProfileForm({
  form,
  isSpin,
  media,
  onFinish,
  onFinishFailed,
  onFileUploaded,
  onFileRemoved,
  submitButtonText
}) {
  const { t } = useTranslation()
  return (
    <Form
      form={form}
      name='editProfileForm'
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <div className="edit-profile upload_photo mx-auto text-center position-relative">
        <div className="img-box rounded-circle overflow-hidden w-100 h-100">
          <Form.Item
            name='icon'
          // rules={validation.profile.icon}
          >
            <UploadMedia
              showWithoutDragger={true}
              actionURL={ApiEndPoints.media.userImage}
              onFileUploaded={onFileUploaded}
              onFileRemoved={onFileRemoved}
              media={media}
              customListType='picture-card'
            />
          </Form.Item>
        </div>
      </div>
      <div className='form-group'>
        <label>{t('common.fName')}</label>
        <Form.Item
          name='firstName'
          rules={validation.profile.firstName}
        >
          <Input
            className='form-control'
            placeholder={t('common.fName')}
          />
        </Form.Item>
      </div>
      <div className='form-group'>
        <label>{t('common.lName')}</label>
        <Form.Item
          name='lastName'
          rules={validation.profile.lastName}
        >
          <Input
            className='form-control'
            placeholder={t('common.lName')}
          />
        </Form.Item>
      </div>
      <div className='form-group'>
        <label>{t('common.email')}</label>
        <Form.Item
          name='email'
          rules={validation.profile.email}
        >
          <Input className='form-control' placeholder={t('common.email')} />
        </Form.Item>
      </div>

      <div class="form-group">
        <label>{t('common.phoneNumber')}</label>
        <div class="input-group count-code">
          <div class="input-group-prepend">
            <Form.Item
              name='phoneNumbeCountryCode'
            >
              <Input disabled className='form-control' placeholder={t('common.phoneNumbeCountryCode')} />
            </Form.Item>
          </div>

          <Form.Item
            name='phoneNumber'
            rules={validation.profile.phoneNumber}
          >
            <Input className='form-control' placeholder={t('common.phoneNumber')} />
          </Form.Item>

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

EditProfileForm.propTypes = {
  form: PropTypes.any.isRequired,
  media: PropTypes.any.isRequired,
  onFileUploaded: PropTypes.func.isRequired,
  onFileRemoved: PropTypes.func.isRequired,
  isSpin: PropTypes.bool.isRequired,
  onFinish: PropTypes.func.isRequired,
  onFinishFailed: PropTypes.func.isRequired,
  submitButtonText: PropTypes.string.isRequired
}
