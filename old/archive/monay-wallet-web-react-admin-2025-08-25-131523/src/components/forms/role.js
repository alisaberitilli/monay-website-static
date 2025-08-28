import React from 'react'
import { useTranslation } from 'react-i18next'
import { Form, Input, Button, Checkbox, Select } from 'antd'
import PropTypes from 'prop-types'
import { LoadingSpinner } from '../common'
import validation from '../../utilities/validation'
import { permissionKeys } from '../../utilities/permissionKey'

export default function RoleForm({
  isSpin,
  form,
  onFinish,
  onFinishFailed,
  goBack,
  submitButtonText,
  onCheckBoxChange,
  onSelectOptionChange
}) {
  const { t } = useTranslation()
  return (
    <Form
      name='addrole'
      form={form}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      initialValues={{ permissionKeys }}

    >
      <div className='form-group'>
        <label>{t('role.name')}</label>
        <Form.Item
          name='role'
          rules={validation.role.name}
        >
          <Input className='form-control' placeholder={t('role.name')} />
        </Form.Item>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>{t('role.module')}</th>
            <th className="text-center">{t('role.action')}</th>
          </tr>
        </thead>
        <Form.List name="permissionKeys">
          {(fields) => (
            <>
              <tbody>
                {fields.map((field, i) => (
                  // <tr key={`${i}`} style={{ display: (permissionKeys[field.fieldKey]['moduleKey'] === 'dashboard') ? 'none' : '' }}>
                  <tr key={`${i}`}>

                    <td width="400">
                      <Form.Item
                        {...field}
                        valuePropName="checked"
                        name={[field.name, 'checkboxVal']}
                        fieldKey={[field.fieldKey, 'checkboxVal']}
                      >
                        {/* <div className="form-check custom-checkbox w-100 custom-control-inline mt-0 mr-0">
                          <Checkbox className="form-check-input custom-control-input ml-0 mt-0" id={`check-box-for_${field.fieldKey}`} />
                          <label className="form-check-label custom-control-label pl-3" for={`check-box-for_${field.fieldKey}`}>

                            {permissionKeys[field.fieldKey]['moduleName']}
                            <span className="checkbox-icon"></span>
                          </label>
                        </div> */}
                        <Checkbox onChange={(e) => onCheckBoxChange()} >{permissionKeys[field.fieldKey]['moduleName']}</Checkbox>
                      </Form.Item>
                    </td>
                    <td className="text-center">
                      <Form.Item
                        name={[field.name, 'selectVal']}
                        fieldKey={[field.fieldKey, 'selectVal']}
                      >
                        <Select placeholder={t('role.permission')} style={{ width: 120 }} onChange={(e) => onSelectOptionChange()}>
                          <Select.Option value=''>Select</Select.Option>
                          <Select.Option value='view'>{t('common.view')}</Select.Option>
                          <Select.Option value='edit'>{t('common.edit')}</Select.Option>
                        </Select>
                      </Form.Item>
                    </td>
                    {/* <td></td> */}
                  </tr>
                ))}
              </tbody>
            </>
          )}
        </Form.List>
      </table>


      <div className='form-group text-center mb-0'>
        <Form.Item>
          <div className='btn-row text-center mt-3 mt-md-4'>
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

RoleForm.propTypes = {
  form: PropTypes.any.isRequired,
  goBack: PropTypes.any.isRequired,
  isSpin: PropTypes.bool.isRequired,
  onFinish: PropTypes.func.isRequired,
  onCheckBoxChange: PropTypes.func.isRequired,
  onSelectOptionChange: PropTypes.func.isRequired,
  onFinishFailed: PropTypes.func.isRequired,
  submitButtonText: PropTypes.string.isRequired
}
