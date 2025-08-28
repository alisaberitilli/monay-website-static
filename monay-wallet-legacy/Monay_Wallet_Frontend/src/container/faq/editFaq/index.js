import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import APIrequest from '../../../services'
import modalNotification from '../../../utilities/notifications'
import BreadCrumb from '../../../components/breadCrumb'
import { Form } from 'antd'
import LoadingView from '../../../components/loadingView'
import NotFoundView from '../../../components/notFoundView'
import ApiEndPoints from '../../../utilities/apiEndPoints'
import textMessages from '../../../utilities/messages'
import MetaTags from '../../../utilities/metaTags'
import FaqForm from '../../../components/forms/faq'
import logger from '../../../utilities/logger'
import config from '../../../config'
import { getPageSizeFromURL, titleCase } from '../../../utilities/common'

function EditFaq(props) {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSpin, setIsSpin] = useState(false)
  const [userType, setUserType] = useState('user')

  const faqData = async (id) => {
    try {
      const payload = {
        ...ApiEndPoints.getSpecificFaq(id)
      }
      const res = await APIrequest(payload)
      setError(false)
      setIsLoading(false)
      form.setFieldsValue({
        question: res.data.question,
        answer: res.data.answer
      })
    } catch (error) {
      logger({ 'error:': error })
      setError(true)
      setIsLoading(false)
    }
  }

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
        ...ApiEndPoints.updateSpecificFaq(props.match.params.faqId),
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
        message: 'Updated',
        description: res.message || textMessages.updateFAQ
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

  useEffect(() => {
    faqData(props.match.params.faqId)

    const { user_type: userType } = getPageSizeFromURL(props.location.search, props.location, true)
    if (userType) {
      setUserType(userType)
    }
  }, [props.match.params.faqId, props.location]) // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return <LoadingView />
  }

  if (error) {
    return <NotFoundView />
  }

  return (
    <>
      <MetaTags
        title={`${config.NAME_TITLE} | ${t('faq.edit')}`}
        description={`${t('faq.edit')} of ${config.NAME_TITLE}`}
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
                    name: `${t('faq.edit')} (${titleCase(userType)})`
                  }
                ]}
              />
              <h2 className='page-title text-capitalize'>
                {t('faq.edit')} ({titleCase(userType)})
              </h2>
            </div>
            <div className='right-side'>
            </div>
          </div>

          <div className="card cardMedium">
            <div className="card-header text-center border-0">
              <h4 className="mb-0">{t('faq.edit')} ({titleCase(userType)})</h4>
            </div>
            <div className="card-body">
              <FaqForm
                isSpin={isSpin}
                form={form}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                goBack={goBack}
                submitButtonText={t('common.update')}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

EditFaq.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired
}

export default EditFaq
