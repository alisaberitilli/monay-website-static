import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import PropTypes from 'prop-types'
import BreadCrumb from '../../../components/breadCrumb'
import { Form } from 'antd'
import APIrequest from '../../../services'
import modalNotification from '../../../utilities/notifications'
import ApiEndPoints from '../../../utilities/apiEndPoints'
import textMessages from '../../../utilities/messages'
import MetaTags from '../../../utilities/metaTags'
import FaqForm from '../../../components/forms/faq'
import logger from '../../../utilities/logger'
import config from '../../../config'
import { getPageSizeFromURL, titleCase } from '../../../utilities/common'

function AddFaq(props) {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [isSpin, setIsSpin] = useState(false)
  const [userType, setUserType] = useState('user')

  useEffect(() => {
    const { user_type: userType } = getPageSizeFromURL(props.location.search, props.location, true)
    if (userType) {
      setUserType(userType)
    }
  }, [props.location])

  const goBack = () => {
    props.history.push({
      pathname: `/faq`,
      search: `?user_type=${userType}`
    })
  }

  const onFinish = async (values) => {
    setIsSpin(true)
    try {
      const payload = {
        ...ApiEndPoints.addFaq,
        bodyData: {
          question: values.question,
          answer: values.answer,
          userType
        }
      }
      const res = await APIrequest(payload)
      setIsSpin(false)
      modalNotification({
        type: 'success',
        message: 'Faq Added',
        description: res.message || textMessages.addFAQ
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
        title={`${config.NAME_TITLE} | ${t('faq.add')}`}
        description={`${t('faq.add')} of ${config.NAME_TITLE}`}
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
                    path: '/manage-cms',
                    name: t('cms.title')
                  },
                  {
                    name: `${t('faq.title')} (${titleCase(userType)})`,
                    path: {
                      pathname: `/faq`,
                      search: `?user_type=${userType}`
                    }
                  },
                  {
                    name: `${t('faq.add')} (${titleCase(userType)})`
                  }
                ]}
              />
              <h2 className='page-title text-capitalize'>
                {t('faq.add')} ({titleCase(userType)})
              </h2>
            </div>
            <div className='right-side'>
            </div>
          </div>

          <div className="card cardMedium">
            <div className="card-header text-center border-0">
              <h4 className="mb-0">{t('faq.add')} ({titleCase(userType)})</h4>
            </div>
            <div className="card-body">
              <FaqForm
                isSpin={isSpin}
                form={form}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                goBack={goBack}
                submitButtonText={t('common.save')}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

AddFaq.propTypes = {
  history: PropTypes.object.isRequired
}

export default AddFaq
