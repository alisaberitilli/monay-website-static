import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import APIrequest from '../../services'
import modalNotification from '../../utilities/notifications'
import BreadCrumb from '../../components/breadCrumb'
import NotFoundView from '../../components/notFoundView'
import LoadingView from '../../components/loadingView'
import ApiEndPoints from '../../utilities/apiEndPoints'
import MetaTags from '../../utilities/metaTags'
import textMessages from '../../utilities/messages'
import CmsForm from '../../components/forms/cms'
import logger from '../../utilities/logger'
import config from '../../config'
import { withTranslation } from 'react-i18next'
import { titleCase } from '../../utilities/common'

class Cms extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      optionsData: {},
      dummyOptionsdata: {},
      isLoading: true,
      isSpin: false,
      error: false
    }
  }

  formRef = React.createRef();
  editorRef = React.createRef();

  componentDidMount() {
    this.fetchCmsOptions(this.props.match.params.cmsPageId)
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.match.params.cmsPageId !== this.props.match.params.cmsPageId
    ) {
      this.setState(
        {
          isLoading: true,
          error: false
        },
        () => {
          this.fetchCmsOptions(this.props.match.params.cmsPageId)
        }
      )
    }
  }

  componentWillUnmount() {
    this.editorRef = null
  }

  fetchCmsOptions = async (id) => {
    try {
      const payload = {
        ...ApiEndPoints.getSpecificCms(id)
      }
      const res = await APIrequest(payload)
      this.setState({
        isLoading: false,
        error: false,
        optionsData: res.data
      }, () => {
        let val = (res.data && ![null, undefined].includes(res.data.pageContent)) ? res.data.pageContent : ''
        this.formRef.current.setFieldsValue({
          title: res.data.pageName,
          content: val
        })
        if (this.editorRef.current !== null && this.editorRef.current.editor !== null) {
          this.editorRef.current.editor.setContent(val)
        }
      })
    } catch (error) {
      logger({ 'error:': error })
      this.setState({
        isLoading: false,
        error: true
      })
    }
  };

  onReset = () => {
    const { optionsData } = this.state
    let val = (optionsData && ![null, undefined].includes(optionsData.pageContent)) ? optionsData.pageContent : ''
    this.formRef.current.setFieldsValue({
      title: optionsData ? optionsData.pageName : '',
      content: val
    })

    this.editorRef.current.editor.setContent(val)
  };

  onFinish = (values) => {
    this.setState({
      isSpin: true
    }, async () => {
      try {
        const payload = {
          ...ApiEndPoints.updateSpecificCms(this.props.match.params.cmsPageId),
          bodyData: {
            pageName: values.title,
            pageContent: values.content
          }
        }
        const res = await APIrequest(payload)
        modalNotification({
          type: 'success',
          message: 'Updated',
          description: res.message || textMessages.updateCMSMessage
        })
        this.setState({
          isSpin: false
        })
      } catch (error) {
        this.setState({
          isSpin: false
        })
        logger({ 'error:': error })
      }
    })
  };

  onFinishFailed = (errorInfo) => {
    logger({ 'Failed:': errorInfo })
  };

  handleEditorChange = (content, editor) => {
    this.formRef.current.setFieldsValue({
      content: content || ''
    })
  };

  render() {
    const { optionsData, error, isLoading, isSpin } = this.state
    const { t } = this.props

    if (isLoading) {
      return <LoadingView />
    }

    if (error) {
      return <NotFoundView />
    }

    return (
      <>
        <MetaTags
          title={`${config.NAME_TITLE} | ${t('cms.title')}`}
          description={`${t('cms.title')} of ${config.NAME_TITLE}`}
        />
        <main className='main-content add-page'>
          <div className='container-fluid'>
            <div className='page-title-row'>
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
                      name: optionsData.pageName
                    }
                  ]}
                />
                <h2 className='page-title'>
                  {optionsData.pageName} ({titleCase(optionsData.userType)})
                </h2>
              </div>
            </div>
            <div className="card cardMedium">
              <div className="card-header text-center border-0">
                <h4 className="mb-0">{t('common.edit')} {optionsData.pageName}</h4>
              </div>
              <div className="card-body">
                <CmsForm
                  onFinish={this.onFinish}
                  onFinishFailed={this.onFinishFailed}
                  formRef={this.formRef}
                  editorRef={this.editorRef}
                  isSpin={isSpin}
                  submitButtonText={t('common.update')}
                  handleEditorChange={this.handleEditorChange}
                  onReset={this.onReset}
                  optionsData={optionsData}
                />
              </div>
            </div>
          </div>
        </main>
      </>
    )
  }
}

const mapStateToProps = (state) => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {}
}

Cms.propTypes = {
  match: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired
}

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(Cms))
