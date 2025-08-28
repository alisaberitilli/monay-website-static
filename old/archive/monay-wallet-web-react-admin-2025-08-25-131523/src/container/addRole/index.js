import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import PropTypes from 'prop-types'
import BreadCrumb from '../../components/breadCrumb'
import { Form } from 'antd'
import APIrequest from '../../services'
import modalNotification from '../../utilities/notifications'
import ApiEndPoints from '../../utilities/apiEndPoints'
import textMessages from '../../utilities/messages'
import MetaTags from '../../utilities/metaTags'
import RoleForm from '../../components/forms/role'
import logger from '../../utilities/logger'
import config from '../../config'
import { permissionKeys } from '../../utilities/permissionKey'

function AddRole(props) {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [isSpin, setIsSpin] = useState(false)

  const goBack = () => {
    props.history.push('/manage-role')
  }
  // for Update Select Option Value 

  const onCheckBoxChange = () => {
    permissionKeys.map(permission => {
      var item2 = form.getFieldsValue().permissionKeys.find(rolePermission => rolePermission.moduleKey === permission.moduleKey);
      console.log("item2", item2.checkboxVal)

      if (item2.checkboxVal) {
        return [permission.checkboxVal = true, permission.selectVal = item2.selectVal !== '' ? item2.selectVal : 'view'];
      }

      else {
        return [permission.checkboxVal = false, permission.selectVal = ''];
      }
    });
    form.setFieldsValue({
      permissionKeys: permissionKeys
    })
  };

  // for Update Check Box Value 

  const onSelectOptionChange = () => {
    permissionKeys.map(permission => {
      var item2 = form.getFieldsValue().permissionKeys.find(rolePermission => rolePermission.moduleKey === permission.moduleKey)
      if (item2.selectVal !== '') {
        return [permission.checkboxVal = true, permission.selectVal = item2.selectVal !== '' ? item2.selectVal : 'view'];
      }

      else {
        return [permission.checkboxVal = false, permission.selectVal = ''];
      }
    });
    form.setFieldsValue({
      permissionKeys: permissionKeys
    })
  };
  const onFinish = async (values) => {
    let rolePermission = [];
    for (var i = 0; i < values.permissionKeys.length; i++) {
      if (values.permissionKeys[i].checkboxVal) {
        rolePermission.push({ 'moduleKey': values.permissionKeys[i].moduleKey, 'permission': (values.permissionKeys[i].selectVal) ? values.permissionKeys[i].selectVal : 'view' });
      }
    };
    setIsSpin(true)
    try {
      const payload = {
        ...ApiEndPoints.addRole,
        bodyData: {
          roleId: 0,
          role: values.role,
          rolePermission: rolePermission
        }
      }

      const res = await APIrequest(payload)
      setIsSpin(false)
      modalNotification({
        type: 'success',
        message: 'Role Added',
        description: res.message || textMessages.addRole
      })
      goBack()
    } catch (error) {
      setIsSpin(false)
      logger({ 'error:': error })
    }
  }

  const onFinishFailed = (errorInfo) => {
    logger({ 'Failed:': errorInfo })
  }

  return (
    <>
      <MetaTags
        title={`${config.NAME_TITLE} | ${t('role.add')}`}
        description={`${t('role.add')} of ${config.NAME_TITLE}`}
      />
      <main className='main-content add-page'>
        <div className='container-fluid'>
          <div className='page-title-row filter-page-btn'>
            <div className='left-side'>
              <BreadCrumb
                bredcrumbs={[
                  {
                    path: '/',
                    name: t('dashboard.title')
                  },
                  {
                    path: '/manage-role',
                    name: t('role.roleTitle')
                  },
                  {
                    name: t('role.add')
                  }

                ]}
              />
              <h2 className='page-title text-capitalize'>
                {t('role.add')}
              </h2>
            </div>
            <div className='right-side'>

            </div>
          </div>

          <div className="card cardMedium">
            <div className="card-header text-center border-0">
              <h4 className="mb-0">{t('role.add')} </h4>
            </div>
            <div className="card-body">
              <RoleForm
                isSpin={isSpin}
                form={form}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                goBack={goBack}
                submitButtonText={t('common.save')}
                onCheckBoxChange={onCheckBoxChange}
                onSelectOptionChange={onSelectOptionChange}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

AddRole.propTypes = {
  history: PropTypes.object.isRequired
}

export default AddRole
