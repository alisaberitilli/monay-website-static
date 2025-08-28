import React, { PureComponent } from 'react'
import RemoteDataTable from '../../components/dataTable'
import {
  readMoreText,
  serialNumberFormatter,
  dateFormatter,
  getPageSizeFromURL,
  addPageSizeInURL,
  userListName, filterDataObj
} from '../../utilities/common'
import ApiEndPoints from '../../utilities/apiEndPoints'
import APIrequest from '../../services'
import ShowMoreText from '../../components/modals/showMoreText'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import logger from '../../utilities/logger'
import { withRouter } from 'react-router'
import MetaTags from '../../utilities/metaTags'
import config from '../../config'
import BreadCrumb from '../../components/breadCrumb'
import { Button, Form, Input } from 'antd'

class ClosedRequest extends PureComponent {
  formRef = React.createRef();

  constructor(props) {
    super(props)
    this.state = {
      isFirstTimeFetching: true,
      openMessageReplyModal: false,
      isLoading: true,
      rowData: {},
      dataOfMessageReply: {},
      data: [],
      totalSize: 0,
      page: 1,
      sizePerPage: 10,
      defaultSorted: [
        {
          dataField: 'updatedAt',
          order: 'desc'
        }
      ],
      columns: [
        {
          dataField: 'id',
          text: props.t('common.id'),
          sort: true,
          hidden: true
        },
        {
          dataField: 'isDummySno',
          text: props.t('common.sNo'),
          // sort: true,
          formatter: (cell, row, rowIndex) => serialNumberFormatter(rowIndex, this.state.page, this.state.sizePerPage)
        },
        {
          dataField: 'User',
          text: props.t('common.name'),
          csvText: props.t('common.name'),
          headerAlign: 'left',
          align: 'left',
          sort: true,
          formatter: (cell, row) => userListName(cell, row.User)
        },
        {
          dataField: 'User.email',
          text: props.t('common.email'),
          csvText: props.t('common.email'),
          headerAlign: 'left',
          align: 'left',
          sort: true
        },
        {
          dataField: 'message',
          text: props.t('common.message'),
          headerAlign: 'left',
          align: 'left',
          classes: 'w_460 text-wrap',
          formatter: (cell, row) => readMoreText(cell, row, 'message', this.showHideMoreText, props.t)
        },
        {
          dataField: 'UserRequestResponse.response',
          text: props.t('common.reply'),
          headerAlign: 'left',
          align: 'left',
          classes: 'w_460 text-wrap',
          formatter: (cell, row) => readMoreText(cell, row, 'reply', this.showHideMoreText, props.t)
        },
        {
          dataField: 'createdAt',
          text: props.t('common.createdAt'),
          headerAlign: 'left',
          align: 'left',
          sort: true,
          formatter: dateFormatter
        },
        {
          dataField: 'updatedAt',
          text: props.t('common.updatedAt'),
          headerAlign: 'left',
          align: 'left',
          sort: true,
          formatter: dateFormatter
        }
      ]
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.location !== this.props.location) {
      if (this.props.location && !this.state.isLoading) {
        const query = this.props.location.search || prevProps.location.search
        this.reFetchOnUrlBasis(query)
      }
    }
  }

  reFetchOnUrlBasis = (query) => {
    const { location } = this.props
    const res = getPageSizeFromURL(query, location)
    if (res) {
      const {
        data: {
          page,
          sizePerPage
        },
        queryParams
      } = res
      this.setState(
        {
          page,
          sizePerPage,
          isLoading: true,
          data: [],
          totalSize: 0
        }, () => {
          this.fetchClosedRequest(queryParams)
        }
      )
    }
  }

  fetchClosedRequest = async (
    queryParams = {
      offset: ((this.state.page - 1) * this.state.sizePerPage),
      limit: this.state.sizePerPage
    }
  ) => {
    queryParams = {
      ...queryParams,
      ...this.state.filterData,
      status: 'closed'
    }
    try {
      const payload = {
        ...ApiEndPoints.getRequest,
        queryParams
      }
      const res = await APIrequest(payload)
      this.setState({
        isLoading: false,
        isFirstTimeFetching: false,
        data: res.data.rows,
        totalSize: res.data.rows.length > 0 ? res.data.total : 0
      })
    } catch (error) {
      logger({ 'error:': error })
    }
  }

  handleToggle = (stateName) => {
    this.setState((state) => {
      return {
        [stateName]: !state[stateName]
      }
    })
  }

  /**
   * To handle the DataTable on change
   */
  handleTableChange = (
    type,
    { page, sizePerPage, filters, sortField, sortOrder, cellEdit }
  ) => {
    this.setState(
      {
        page,
        sizePerPage,
        isLoading: true,
        data: [],
        totalSize: 0
      },
      () => {
        if (sortField === 'User') {
          sortField = 'name'
        }
        if (sortField === 'User.email') {
          sortField = 'email'
        }
        if (sortField === 'isDummySno') {
          sortField = 'id'
        }
        const queryParams = {
          offset: ((page - 1) * sizePerPage),
          limit: sizePerPage,
          sortBy: sortField,
          sortType: sortOrder
        }
        if (!this.state.isFirstTimeFetching) {
          addPageSizeInURL(page, sizePerPage, this.props.history, { tab: 'closed' })
        }
        this.fetchOnHandleTableChange(queryParams)
      }
    )
  }

  fetchOnHandleTableChange = (queryParams) => {
    if (this.state.isFirstTimeFetching) {
      const { location } = this.props

      if (location) {
        const query = location.search
        const res = getPageSizeFromURL(query, location)
        if (res) {
          this.reFetchOnUrlBasis(query)
        } else {
          this.fetchClosedRequest(queryParams)
        }
      }
    } else {
      this.fetchClosedRequest(queryParams)
    }
  }

  showHideMoreText = (dataOfMessageReply = {}) => {
    this.setState(
      {
        dataOfMessageReply
      },
      () => {
        this.handleToggle('openMessageReplyModal')
      }
    )
  }

  onFinish = async (values) => {
    const { filterData, filterCount } = filterDataObj(values)
    this.setState(
      {
        isLoading: true,
        data: [],
        totalSize: 0,
        page: 1,
        filterData,
        filterCount
      },
      () => {
        this.fetchClosedRequest()
      }
    )
  };

  onFinishFailed = (errorInfo) => {
    logger({ 'Failed:': errorInfo })
  };

  onReset = () => {
    this.setState({
      isLoading: true,
      data: [],
      totalSize: 0,
      page: 1,
      filterData: {},
      filterCount: 0
    }, () => {
      this.formRef.current.resetFields()
      this.fetchClosedRequest()
    })
  };

  render() {
    const {
      data,
      totalSize,
      page,
      sizePerPage,
      defaultSorted,
      columns,
      isLoading,
      dataOfMessageReply,
      openMessageReplyModal
    } = this.state

    const { t } = this.props

    return (
      <>
        <MetaTags
          title={`${config.NAME_TITLE} | ${t('support.closedReq')}`}
          description={`${t('support.closedReq')} of ${config.NAME_TITLE}`}
        />
        <main className='main-content admin-dashboard'>
          <div className='container-fluid'>
            <div className='page-title-row'>
              <div className='left-side'>
                <BreadCrumb
                  bredcrumbs={[
                    {
                      name: t('dashboard.title'),
                      path: '/'
                    },
                    {
                      name: t('support.closedReq')
                    }
                  ]}
                />
                <h2 className='page-title text-capitalize mb-0'>
                  {t('support.closedReq')}
                </h2>
              </div>
              <div className='right-side'>
                <a aria-controls="filterSection" aria-expanded="false" className="btn btn-primary ripple-effect d-lg-none collapsed btnFilter" data-toggle="collapse" href="#filterSection" id="filterbtn" role="button">
                  <i className="icon-filter1"></i>
                </a>
              </div>
            </div>
            <>
              <div className="filter_section collapse d-lg-block" id="filterSection">
                <Form
                  name='userFilter'
                  // className='form-inline'
                  ref={this.formRef}
                  onFinish={this.onFinish}
                  onFinishFailed={this.onFinishFailed}
                  initialValues={{
                    status: ''
                  }}
                >
                  <div className="form_field d-flex flex-wrap align-items-center">
                    <div className='form-group'>
                      <Form.Item name='name'>
                        <Input
                          className='form-control'
                          placeholder={t('common.name')}
                        />
                      </Form.Item>
                    </div>
                    <div className='form-group'>
                      <Form.Item name='email'>
                        <Input
                          className='form-control'
                          placeholder={t('common.emailAddress')}
                        />
                      </Form.Item>
                    </div>
                    <div className="btn_clumn">
                      <Button
                        htmlType='submit'
                        className='btn btn-primary ripple-effect d-inline-flex align-items-center justify-content-center mr-1'
                      >
                        <i className="icon-search"></i>
                      </Button>
                      <Button
                        htmlType='button'
                        onClick={this.onReset}
                        className='btn btn-outline-danger ripple-effect d-inline-flex align-items-center justify-content-center btnReset'
                      >
                        <i className="icon-refresh"></i>
                      </Button>
                    </div>
                  </div>
                </Form>
              </div>
            </>
            <RemoteDataTable
              data={data}
              page={page}
              sizePerPage={sizePerPage}
              totalSize={totalSize}
              onTableChange={this.handleTableChange}
              isFilter={false}
              columns={columns}
              defaultSorted={defaultSorted}
              loading={isLoading}
            />
            {/* Message  */}
            <ShowMoreText
              title={t('common.message')}
              data={Object.keys(dataOfMessageReply).length ? dataOfMessageReply.data : ''}
              show={openMessageReplyModal}
              onHide={this.showHideMoreText}
            />
          </div>
        </main>
      </>
    )
  }
}

ClosedRequest.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object,
  t: PropTypes.func.isRequired
}

export default withTranslation()(withRouter(ClosedRequest))
