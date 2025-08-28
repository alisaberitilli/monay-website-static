import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import APIrequest from '../../services'
import modalNotification from '../../utilities/notifications'
import BreadCrumb from '../../components/breadCrumb'
import { Form } from 'antd'
import LoadingView from '../../components/loadingView'
import NotFoundView from '../../components/notFoundView'
import ApiEndPoints from '../../utilities/apiEndPoints'
import textMessages from '../../utilities/messages'
import MetaTags from '../../utilities/metaTags'
import RoleForm from '../../components/forms/role'
import logger from '../../utilities/logger'
import config from '../../config'
import { permissionKeys } from '../../utilities/permissionKey'

function EditRole(props) {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSpin, setIsSpin] = useState(false)

  const roleData = async (id) => {
    try {
      const payload = {
        ...ApiEndPoints.getSpecificRole(id)
      }
      const res = await APIrequest(payload)
      setError(false)
      setIsLoading(false)

      permissionKeys.map(permission => {
        var item2 = res.data.RolePermissions.find(rolePermission => rolePermission.moduleKey === permission.moduleKey);
        if (item2) {
          return [permission.checkboxVal = true, permission.selectVal = item2.permission];
        } else {
          return [permission.checkboxVal = false, permission.selectVal = ''];
        }
      });

      form.setFieldsValue({
        role: res.data.role,
        permissionKeys: permissionKeys
      })
    } catch (error) {
      logger({ 'error:': error })
      setError(true)
      setIsLoading(false)
    }
  }

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
      if (rolePermission.length === 0) {
        setIsSpin(false)
        modalNotification({
          type: 'error',
          message: 'Role Permission',
          description: 'Please Select At Least One Role Permission.'
        })
      } else {
        const payload = {
          ...ApiEndPoints.addRole,
          bodyData: {
            roleId: props.match.params.roleId,
            role: values.role,
            rolePermission: rolePermission
          }
        }
        const res = await APIrequest(payload)
        setIsSpin(false)
        modalNotification({
          type: 'success',
          message: 'Updated',
          description: res.message || textMessages.updateRole
        })
        goBack()
      }

    } catch (error) {
      setIsSpin(false)
      logger({ 'error:': error })
    }
  }

  const onFinishFailed = (errorInfo) => {
    logger({ 'Failed:': errorInfo })
  }

  useEffect(() => {
    roleData(props.match.params.roleId)
  }, [props.match.params.roleId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return <LoadingView />
  }

  if (error) {
    return <NotFoundView />
  }

  return (
    <>
      <MetaTags
        title={`${config.NAME_TITLE} | ${t('role.edit')}`}
        description={`${t('role.edit')} of ${config.NAME_TITLE}`}
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
                    name: t('role.edit')
                  }

                ]}
              />
              <h2 className='page-title text-capitalize'>
                {t('role.edit')}
              </h2>
            </div>
            <div className='right-side'>

            </div>
          </div>

          <div className="card cardMedium">
            <div className="card-header text-center border-0">
              <h4 className="mb-0">{t('role.edit')} </h4>
            </div>
            <div className="card-body">
              <RoleForm
                isSpin={isSpin}
                form={form}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                goBack={goBack}
                submitButtonText={t('common.update')}
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

EditRole.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired
}

export default EditRole
