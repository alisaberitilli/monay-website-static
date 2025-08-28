import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, Input, Select, Button, Alert } from 'antd'
import PropTypes from 'prop-types'
import validation from '../../utilities/validation'
import { LoadingSpinner } from '../common'
import { selectRoles } from '../../redux/common/commonSlice'
import { useSelector } from 'react-redux'

export default function SubadminForm({
  onHide,
  isSpin,
  onFinish,
  onFinishFailed,
  initialValues,
  submitButtonText,
  errorMsg,
  isEdit
}) {
  const { t } = useTranslation()
  const roles = useSelector(selectRoles)
  const [isDisble, setisDisble] = useState(true);

  const resEmailHandleChange = (e) => {

    if (e.target.value != initialValues.email) {
      setisDisble(false);
    }
  }
  return (
    <>
      {errorMsg && (
        <Alert
          message={errorMsg}
          className='mb-4'
          type='error'
        />
      )}
      <Form
        name='approverAddEdit'
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        initialValues={initialValues}
      >
        <div className='row'>
          <div className='col-6'>
            <div className='form-group'>
              <label>{t('subadmin.firstName')}</label>
              <Form.Item
                name='firstName'
                rules={validation.subadmin.firstName}
              >
                <Input className='form-control' placeholder={t('subadmin.firstName')} />
              </Form.Item>
            </div>
          </div>
          <div className='col-6'>
            <div className='form-group'>
              <label>{t('subadmin.lastName')}</label>
              <Form.Item
                name='lastName'
                rules={validation.subadmin.lastName}
              >
                <Input className='form-control' placeholder={t('subadmin.lastName')} />
              </Form.Item>
            </div>
          </div>



          <div className='col-6'>< div className='form-group'>
            <label>{t('subadmin.email')}</label>
            <Form.Item
              name='email'
              rules={validation.subadmin.email}
            >
              <Input className='form-control' placeholder={t('subadmin.email')} onChange={(e) => {
                resEmailHandleChange(e)
              }} />
            </Form.Item>
          </div> </div>
          {(!isEdit) ? <div className='col-6'>
            <div className='form-group position-relative'>
              <label>{t('subadmin.password')}</label>
              <Form.Item
                name='password'
                rules={validation.subadmin.password}
              >
                <Input.Password
                  className='form-control'
                  placeholder={t('subadmin.password')}
                />
              </Form.Item>
            </div>
          </div> : <div className='col-6'>
              <div className='form-group position-relative'>
                <label>{t('subadmin.password')}</label>
                <Form.Item
                  name='password'

                  rules={(!isDisble) ? validation.subadmin.password : ''}
                >
                  <Input.Password
                    disabled={isDisble}
                    className='form-control'
                    placeholder={t('subadmin.password')}
                  />
                </Form.Item>
              </div>
            </div>
          }

          <div className='col-6'>
            <div className='form-group'>
              <label>{t('common.status')} </label>
              <Form.Item
                name='status'
              >
                <Select className='text-capitalize' placeholder={t('common.status')}>
                  <Select.Option value='active'>{t('common.active')}</Select.Option>
                  <Select.Option value='inactive'>{t('common.inactive')}</Select.Option>
                </Select>
              </Form.Item>
            </div>
          </div>
          <div className='col-6'>
            <div className='form-group'>
              <label>{t('role.name')} </label>
              <Form.Item
                name='roleId'
                rules={validation.subadmin.roleId}
              >
                <Select className='text-capitalize' placeholder={t('role.name')}>
                  {
                    roles.map((roleData, i) => {
                      return <Select.Option key={`role_${roleData.id}_${i}`} className='text-capitalize' value={roleData.id}>{roleData.role}</Select.Option>
                    })
                  }
                </Select>
              </Form.Item>
            </div>
          </div>

          <div className='col-md-6'>
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
        </div>
        </div>
        <div className='form-group btn-row text-center mb-0'>
          <Form.Item>
            <Button disabled={isSpin} htmlType='submit' className='btn btn-primary width-120 ripple-effect text-uppercase mr-2'>
              {isSpin ? <LoadingSpinner /> : submitButtonText}
            </Button>
            <Button
              htmlType='button'
              onClick={onHide}
              className='btn btn-outline-dark width-120 ripple-effect text-uppercase'
            >
              {t('common.cancel')}
            </Button>
          </Form.Item>
        </div>
      </Form>
    </>
  )
}

SubadminForm.propTypes = {
  onHide: PropTypes.func.isRequired,
  isSpin: PropTypes.bool.isRequired,
  onFinish: PropTypes.func.isRequired,
  onFinishFailed: PropTypes.func.isRequired,
  initialValues: PropTypes.object.isRequired,
  submitButtonText: PropTypes.string.isRequired,
  errorMsg: PropTypes.string.isRequired
}
