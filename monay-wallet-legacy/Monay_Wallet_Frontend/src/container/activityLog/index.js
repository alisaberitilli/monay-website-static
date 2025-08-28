import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import RemoteDataTable from '../../components/dataTable'
import BreadCrumb from '../../components/breadCrumb'
import APIrequest from '../../services'
import {
  dateFormatter,
  dateFormatDMY,
  serialNumberFormatter,
  getPageSizeFromURL,
  addPageSizeInURL,
  filterDataObj, currentDate, userListName, userListNameCSV, csvDateFormatter,
  messageFormatter,
  messageCSVFormatter,
  csvPhoneNumberFormatter,
  phoneNumberFormatter
} from '../../utilities/common'
import { Form, Select, Input, Button, DatePicker } from 'antd'
import MetaTags from '../../utilities/metaTags'
import ApiEndPoints from '../../utilities/apiEndPoints'
import textMessages from '../../utilities/messages'
import logger from '../../utilities/logger'
import config from '../../config'
import moment from "moment";

class ActivityLog extends PureComponent {
  formRef = React.createRef();

  constructor(props) {
    super(props)

    this.state = {
      isFirstTimeFetching: true,
      isLoading: true,
      data: [],
      filterData: {},
      qrData: {},
      openQrModal: false,
      kycData: {},
      openKycModal: false,
      filterCount: 0,
      totalSize: 0,
      page: 1,
      sizePerPage: 10,
      defaultSorted: [
        {
          dataField: 'id',
          order: 'desc'
        }
      ],
      columns: [
        {
          dataField: 'id',
          text: props.t('common.id'),
          csvText: props.t('common.id'),
          sort: true,
          hidden: true,
          csvExport: false,
        },
        {
          dataField: 'isDummySno',
          text: props.t('common.sNo'),
          csvExport: false,
          // sort: true,
          formatter: (cell, row, rowIndex) => serialNumberFormatter(rowIndex, this.state.page, this.state.sizePerPage)

        },
        {
          dataField: 'isDummyName',
          text: props.t('common.name'),
          csvText: props.t('common.name'),
          headerAlign: 'left',
          align: 'left',
          sort: true,
          formatter: (cell, row) => userListName(cell, row.adminUser),
          csvFormatter: (cell, row) => userListNameCSV(cell, row.adminUser)
        },
        {
          dataField: 'adminUser.email',
          text: props.t('common.email'),
          csvText: props.t('common.email'),
          headerAlign: 'left',
          align: 'left',
          sort: true,
          hidden: true

        },
        {
          dataField: 'adminUser.phoneNumber',
          text: props.t('common.phoneNumber'),
          csvText: props.t('common.phoneNumber'),
          csvType: Number,
          headerAlign: 'left',
          align: 'left',
          sort: true,
          formatter: (cell, row) => phoneNumberFormatter(cell, row.adminUser),
          csvFormatter: (cell, row) => csvPhoneNumberFormatter(cell, row.adminUser),
        },
        {
          dataField: 'adminUser.userType',
          text: props.t('activityLog.userType'),
          csvText: props.t('activityLog.userType'),
          csvType: String,
          headerAlign: 'left',
          align: 'left',
          sort: true,
          style: {
            textTransform: 'capitalize'
          },
        },
        {
          dataField: 'ip',
          text: props.t('activityLog.ip'),
          csvText: props.t('activityLog.ip'),
          csvType: Number,
          headerAlign: 'left',
          align: 'left',
          sort: true
        },
        {
          dataField: 'createdAt',
          text: props.t('common.dateTime'),
          csvText: props.t('common.dateTime'),
          csvType: Date,
          headerAlign: 'left',
          align: 'left',
          sort: true,
          formatter: dateFormatter,
          csvFormatter: csvDateFormatter,
        },
        {
          dataField: 'message',
          text: props.t('activityLog.action'),
          csvText: props.t('activityLog.action'),
          csvType: String,
          headerAlign: 'left',
          align: 'left',
          sort: false,
          formatter: messageFormatter,
          csvFormatter: (cell, row) => messageCSVFormatter(cell, row),
        },


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
          this.fetchActivityLogs(queryParams)
        }
      )
    }
  }

  fetchActivityLogs = async (
    queryParams = {
      offset: ((this.state.page - 1) * this.state.sizePerPage),
      limit: this.state.sizePerPage
    }
  ) => {
    queryParams = {
      ...queryParams,
      ...this.state.filterData,
    }
    try {
      const payload = {
        ...ApiEndPoints.getActivityLog,
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
  };

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
        if (sortField === 'isDummySno') {
          sortField = 'id'
        } else if (sortField === 'isDummyName') {
          sortField = 'name'
        } else if (sortField === 'adminUser.userType') {
          sortField = 'userType'
        } else if (sortField === 'adminUser.phoneNumber') {
          sortField = 'phoneNumber'
        }
        const queryParams = {
          offset: ((page - 1) * sizePerPage),
          limit: sizePerPage,
          sortBy: sortField,
          sortType: sortOrder
        }

        if (!this.state.isFirstTimeFetching) {
          addPageSizeInURL(page, sizePerPage, this.props.history)
        }
        this.fetchOnHandleTableChange(queryParams)
      }
    )
  };

  fetchOnHandleTableChange = (queryParams) => {
    if (this.state.isFirstTimeFetching) {
      const { location } = this.props

      if (location) {
        const query = location.search
        const res = getPageSizeFromURL(query, location)
        if (res) {
          this.reFetchOnUrlBasis(query)
        } else {
          this.fetchActivityLogs(queryParams)
        }
      }
    } else {
      this.fetchActivityLogs(queryParams)
    }
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
        this.fetchActivityLogs()
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
      this.fetchActivityLogs()
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
      filterCount
    } = this.state

    const { t } = this.props

    const noDataMessage = filterCount > 0 ? textMessages.noDataFound : textMessages.noDataUserList

    return (
      <>
        <MetaTags
          title={`${config.NAME_TITLE} | ${t('activityLog.title')}`}
          description={`${t('activityLog.title')} of ${config.NAME_TITLE}`}
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
                      name: t('activityLog.title')
                    }
                  ]}
                />
                <h2 className='page-title text-capitalize mb-0'>
                  {t('activityLog.title')}
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
                    status: '',
                    kycStatus: ''
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
                    <div className='form-group'>
                      <Form.Item name='phoneNumber'>
                        <Input
                          className='form-control'
                          placeholder={t('common.phoneNumber')}
                        />
                      </Form.Item>
                    </div>
                    <div className='form-group'>
                      <Form.Item name='userType'>
                        <Select className='form-control' placeholder={t('activityLog.userType')}>
                          <Select.Option value=''>{t('activityLog.allUserType')}</Select.Option>
                          <Select.Option value='admin'>{t('activityLog.admin')}</Select.Option>
                          <Select.Option value='subadmin'>{t('activityLog.subAdmin')}</Select.Option>

                        </Select>
                      </Form.Item>
                    </div>
                    <div className='form-group'>
                      <Form.Item name='ip'>
                        <Input
                          className='form-control'
                          placeholder={t('activityLog.ip')}
                        />
                      </Form.Item>
                    </div>
                    <div className='form-group'>
                      <Form.Item name='activityType'>
                        <Select className='form-control' placeholder={t('activityLog.allActionTypes')}>
                          <Select.Option value=''>{t('activityLog.allActionTypes')}</Select.Option>
                          <Select.Option value='login'>{t('activityLog.login')}</Select.Option>
                          <Select.Option value='logout'>{t('activityLog.logout')}</Select.Option>
                          <Select.Option value='change_password'>{t('activityLog.change_password')}</Select.Option>
                          <Select.Option value='update_profile'>{t('activityLog.update_profile')}</Select.Option>
                          <Select.Option value='change_status'>{t('activityLog.change_status')}</Select.Option>
                          <Select.Option value='change_kyc_status'>{t('activityLog.change_kyc_status')}</Select.Option>
                          <Select.Option value='change_transaction_status'>{t('activityLog.change_transaction_status')}</Select.Option>
                          <Select.Option value='user_update_cms'>{t('activityLog.user_update_cms')}</Select.Option>
                          <Select.Option value='merchant_update_cms'>{t('activityLog.merchant_update_cms')}</Select.Option>
                          <Select.Option value='user_add_faq'>{t('activityLog.user_add_faq')}</Select.Option>
                          <Select.Option value='user_update_faq'>{t('activityLog.user_update_faq')}</Select.Option>
                          <Select.Option value='merchant_update_faq'>{t('activityLog.merchant_update_faq')}</Select.Option>
                          <Select.Option value='user_delete_faq'>{t('activityLog.user_delete_faq')}</Select.Option>
                          <Select.Option value='merchant_delete_faq'>{t('activityLog.merchant_delete_faq')}</Select.Option>
                          <Select.Option value='sms_setting'>{t('activityLog.sms_setting')}</Select.Option>
                          <Select.Option value='email_setting'>{t('activityLog.email_setting')}</Select.Option>
                          <Select.Option value='kyc_setting'>{t('activityLog.kyc_setting')}</Select.Option>
                        </Select>
                      </Form.Item>
                    </div>
                    <div className='form-group form-group-date'>
                      <Form.Item name='createdAt'>
                        <DatePicker.RangePicker
                          placeholder={[t('common.startDate'), t('common.endDate')]}
                          getPopupContainer={node => node.parentNode} // https://github.com/ant-design/ant-design/issues/22987
                          format={dateFormatDMY}
                          disabledDate={current => {
                            return current && current > moment();
                          }}
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
              excelColumns={columns}
              // selectRow={{}}
              defaultSorted={defaultSorted}
              loading={isLoading}
              noDataMessage={noDataMessage}
              fileName={`Monay_Activity_log_Listing_${currentDate()}.csv`}
            />
          </div>
        </main>
      </>
    )
  }
}

ActivityLog.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object,
  t: PropTypes.func.isRequired
}

export default withTranslation()(ActivityLog)
