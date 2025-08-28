import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import moment from "moment";
import RemoteDataTable from '../../components/dataTable'
import BreadCrumb from '../../components/breadCrumb'
import APIrequest from '../../services'
import { connect } from 'react-redux'
import {
  dateFormatter,
  dateFormatDMY,
  serialNumberFormatter,
  getPageSizeFromURL,
  addPageSizeInURL,
  filterDataObj,
  userListName,
  amountFormatter,
  withdrawalStatusFormatter,
  statusHighlightFormatter,
  bankAccountFormatter, currentDate,
  userListNameCSV,
  csvDateFormatter,
  csvAmountFormatter,
  CsvWithdrawalStatusFormatter,
  CsvBankAccountFormatter,
  checkUserPermission
} from '../../utilities/common'
import { Form, Input, Button, DatePicker, Select } from 'antd'
import MetaTags from '../../utilities/metaTags'
import ApiEndPoints from '../../utilities/apiEndPoints'
import modalNotification from '../../utilities/notifications'
import textMessages from '../../utilities/messages'
import logger from '../../utilities/logger'
import config from '../../config'
import ShowMoreText from '../../components/modals/showMoreText'
import { Link } from 'react-router-dom'
import * as QueryString from "query-string"


class WithdrawalTransaction extends PureComponent {
  formRef = React.createRef();

  constructor(props) {
    super(props)

    this.state = {
      isFirstTimeFetching: true,
      isLoading: true,
      openMessageReplyModal: false,
      data: [],
      filterData: {},
      dataOfMessageReply: {},
      filterCount: 0,
      totalSize: 0,
      currencySymbol: '',
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
          dataField: 'transactionId',
          text: props.t('transaction.transactionId'),
          csvText: props.t('transaction.transactionId'),
          headerAlign: 'left',
          align: 'left',
          sort: true
        },
        {
          dataField: 'fromUser',
          text: props.t('common.name'),
          csvText: props.t('common.name'),
          headerAlign: 'left',
          align: 'left',
          sort: true,
          formatter: (cell, row) => userListName(cell, row.fromUser),
          csvFormatter: (cell, row) => userListNameCSV(cell, row.fromUser)
        },
        {
          dataField: 'fromUser.email',
          text: props.t('common.email'),
          csvText: props.t('common.email'),
          headerAlign: 'left',
          align: 'left',
          sort: true,
          hidden: true
        },
        {
          dataField: 'amount',
          text: props.t('transaction.amount'),
          csvText: props.t('transaction.amount'),
          headerAlign: 'left',
          align: 'left',
          sort: true,
          formatter: (cell, row) => amountFormatter(cell, row, this.state.currencySymbol),
          csvFormatter: (cell, row) => csvAmountFormatter(cell, row, this.state.currencySymbol)
        },
        {
          dataField: 'status',
          text: props.t('transaction.transactionStatus'),
          csvText: props.t('transaction.transactionStatus'),
          headerAlign: 'left',
          align: 'left',
          style: {
            textTransform: 'capitalize'
          },
          classes: 'disable-color',
          formatter: statusHighlightFormatter
        },
        {
          dataField: 'last4Digit',
          text: props.t('transaction.bankAccountNumber'),
          csvText: props.t('transaction.bankAccountNumber'),
          headerAlign: 'left',
          align: 'left',
          sort: false,
          formatter: bankAccountFormatter,
          csvFormatter: CsvBankAccountFormatter
        },
        {
          dataField: 'createdAt',
          text: props.t('common.reqDateTime'),
          csvText: props.t('common.reqDateTime'),
          csvType: Date,
          headerAlign: 'left',
          align: 'left',
          sort: true,
          formatter: dateFormatter,
          csvFormatter: csvDateFormatter,
        },
        {
          dataField: 'updatedAt',
          text: props.t('common.apprvRejctDate'),
          csvText: props.t('common.apprvRejctDate'),
          csvType: Date,
          headerAlign: 'left',
          align: 'left',
          sort: true,
          // formatter: dateFormatter
          formatter: (cell, row) => (row.paymentStatus !== 'pending' && row.paymentStatus !== 'failed') ? dateFormatter(cell)
            : '-',
          csvFormatter: (cell, row) => (row.paymentStatus !== 'pending' && row.paymentStatus !== 'failed') ? csvDateFormatter(cell)
            : '-',
        },
        {
          dataField: 'paymentStatus',
          text: props.t('transaction.withdrawalStatus'),
          csvText: props.t('transaction.withdrawalStatus'),
          headerAlign: 'left',
          align: 'left',
          style: {
            textTransform: 'capitalize'
          },
          formatter: (cell, row) => withdrawalStatusFormatter(cell, row, this.onchangeWithdrawalStatus, '', 'withdrawal_request'),
          CsvFormatter: (cell, row) => CsvWithdrawalStatusFormatter(cell, row)
        },
        // {
        //   dataField: 'isDummyField',
        //   text: props.t('common.action'),
        //   csvExport: false,
        //   headerAlign: 'left',
        //   align: 'left',
        //   formatter: this.actionFormatter
        // }
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
          this.fetchTransaction(queryParams)
        }
      )
    }
  }

  fetchTransaction = async (
    queryParams = {
      offset: ((this.state.page - 1) * this.state.sizePerPage),
      limit: this.state.sizePerPage
    },
    querystringParam = QueryString.parse(this.props.location.search)
  ) => {
    queryParams = {
      ...queryParams,
      ...this.state.filterData,
      actionType: 'withdrawal',
      dashboardTarnsactionStatus: querystringParam.paymentStatus || ''
    }
    try {
      const payload = {
        ...ApiEndPoints.getTransaction,
        queryParams
      }
      const res = await APIrequest(payload)
      this.setState({
        isLoading: false,
        isFirstTimeFetching: false,
        data: res.data.rows,
        totalSize: res.data.rows.length > 0 ? res.data.total : 0,
        currencySymbol: (res.data.currencySymbol) ? res.data.currencySymbol : '',
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
        } else if (sortField === 'fromUser') {
          sortField = 'fromUserId'
        } else if (sortField === 'toUser') {
          sortField = 'toUserId'
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
          this.fetchTransaction(queryParams)
        }
      }
    } else {
      this.fetchTransaction(queryParams)
    }
  }

  onchangeWithdrawalStatus = async (status, row, resHandleChange) => {
    try {
      const payload = {
        ...ApiEndPoints.updateWithdrawalStatus(row.id),
        bodyData: {
          status
        }
      }
      const res = await APIrequest(payload)
      modalNotification({
        type: 'success',
        message: 'Success',
        description: res.message || textMessages.statusUpdate
      })
      const dataTemp = this.state.data
      const indexData = dataTemp.findIndex((d) => d.id === row.id)
      if (indexData > -1) {
        dataTemp[indexData].paymentStatus = status
      }
      this.setState({
        data: dataTemp
      })
      resHandleChange(status)
    } catch (error) {
      resHandleChange(row.status)
      logger({ 'error:': error })
    }
  };


  actionFormatter = (cell, row) => {
    const { t } = this.props
    const userDetail = `/user-detail/${row.id}`
    return (
      <div className='dropdown action_btn'>
        <a
          href='/'
          onClick={(e) => e.preventDefault()}
          className='dropdown-toggle'
          id={`dropdownMenuButton_${row.id}`}
          data-toggle='dropdown'
          aria-haspopup='true'
          aria-expanded='false'
        >
          <span className='icon-keyboard_control'></span>
        </a>
        <div className='dropdown-menu' aria-labelledby='dropdownMenuButton'>
          <Link
            className="dropdown-item"
            to={userDetail}
          >{t('common.view')}</Link>
        </div>
      </div>
    )
  };


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
        this.fetchTransaction()
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
      this.fetchTransaction()
    })
  };

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

  handleToggle = (stateName) => {
    this.setState((state) => {
      return {
        [stateName]: !state[stateName]
      }
    })
  }

  render() {
    const {
      data,
      totalSize,
      page,
      sizePerPage,
      defaultSorted,
      columns,
      isLoading,
      filterCount,
      dataOfMessageReply,
      openMessageReplyModal
    } = this.state

    const { t } = this.props

    const noDataMessage = filterCount > 0 ? textMessages.noDataFound : textMessages.noDataTransactionList

    return (
      <>
        <MetaTags
          title={`${config.NAME_TITLE} | ${t('transaction.withdrawalTransaction')}`}
          description={`${t('transaction.withdrawalTransaction')} of ${config.NAME_TITLE}`}
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
                      name: t('transaction.withdrawalTransaction')
                    }
                  ]}
                />
                <h2 className='page-title text-capitalize mb-0'>
                  {t('transaction.withdrawalTransaction')}
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
                  name='merchantFilter'
                  // className='form-inline'
                  ref={this.formRef}
                  onFinish={this.onFinish}
                  onFinishFailed={this.onFinishFailed}
                  initialValues={{
                    status: '',
                    paymentStatus: ''
                  }}
                >
                  <div className="form_field d-flex flex-wrap align-items-center">
                    <div className='form-group'>
                      <Form.Item name='transactionId'>
                        <Input
                          className='form-control'
                          placeholder={t('transaction.transactionId')}
                        />
                      </Form.Item>
                    </div>
                    <div className='form-group'>
                      <Form.Item name='fromName'>
                        <Input
                          className='form-control'
                          placeholder={t('common.name')}
                        />
                      </Form.Item>
                    </div>
                    <div className='form-group'>
                      <Form.Item name='fromEmail'>
                        <Input
                          className='form-control'
                          placeholder={t('common.email')}
                        />
                      </Form.Item>
                    </div>
                    <div className='form-group'>
                      <Form.Item name='minAmount'>
                        <Input
                          className='form-control'
                          placeholder={t('transaction.minAmount')}
                        />
                      </Form.Item>
                    </div>
                    <div className='form-group'>
                      <Form.Item name='maxAmount'>
                        <Input
                          className='form-control'
                          placeholder={t('transaction.maxAmount')}
                        />
                      </Form.Item>
                    </div>
                    <div className='form-group'>
                      <Form.Item name='status'>
                        <Select className='form-control' placeholder={t('transaction.transactionStatus')}>
                          <Select.Option value=''>{t('transaction.transactionStatus')}</Select.Option>
                          <Select.Option value='success'>{t('common.success')}</Select.Option>
                          <Select.Option value='failed'>{t('common.failed')}</Select.Option>
                        </Select>
                      </Form.Item>
                    </div>
                    <div className='form-group'>
                      <Form.Item name='paymentStatus'>
                        <Select className='form-control' placeholder={t('transaction.withdrawalStatus')}>
                          <Select.Option value=''>{t('transaction.withdrawalStatus')}</Select.Option>
                          <Select.Option value='pending'>{t('common.pending')}</Select.Option>
                          <Select.Option value='completed'>{t('common.completed')}</Select.Option>
                          <Select.Option value='cancelled'>{t('common.rejected')}</Select.Option>
                          <Select.Option value='failed'>{t('common.failed')}</Select.Option>
                        </Select>
                      </Form.Item>
                    </div>
                    <div className='form-group form-group-date'>
                      <Form.Item name='createdAt'>
                        <DatePicker.RangePicker
                          placeholder={[t('common.transactionStartDate'), t('common.apprvRejctDate')]}
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
            {
              checkUserPermission(this.props.userData, 'withdrawal_request') ?
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
                  fileName={`Monay_Withdrawal_Request_Listing_${currentDate()}.csv`}
                /> :
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
                />
            }
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

const mapStateToProps = (state) => {
  return {
    userData: state.auth.userData || ''
  }
}

WithdrawalTransaction.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object,
  t: PropTypes.func.isRequired
}

export default withTranslation()(connect(mapStateToProps)(WithdrawalTransaction))

