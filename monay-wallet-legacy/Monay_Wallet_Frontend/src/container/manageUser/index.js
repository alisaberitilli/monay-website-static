import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import RemoteDataTable from '../../components/dataTable'
import BreadCrumb from '../../components/breadCrumb'
import APIrequest from '../../services'
import { connect } from 'react-redux'
import {
  phoneNumberFormatter,
  userStatusFormatter,
  statusKycFormatter,
  dateFormatter,
  dateFormatDMY,
  serialNumberFormatter,
  getPageSizeFromURL,
  addPageSizeInURL,
  filterDataObj, currentDate, userListName, userListNameCSV, csvDateFormatter, csvStatusKycFormatter, csvPhoneNumberFormatter,
  checkUserPermission,
  csvSimpleFormatter
} from '../../utilities/common'
import { Form, Select, Input, Button, DatePicker } from 'antd'
import MetaTags from '../../utilities/metaTags'
import ApiEndPoints from '../../utilities/apiEndPoints'
import modalNotification from '../../utilities/notifications'
import textMessages from '../../utilities/messages'
import logger from '../../utilities/logger'
import config from '../../config'
import { Link } from 'react-router-dom'
import ShowQR from '../../components/modals/showQR'
import ShowKyc from '../../components/modals/showKyc'
import moment from "moment";

class ManageUser extends PureComponent {
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
          formatter: userListName,
          csvFormatter: userListNameCSV
        },
        {
          dataField: 'userType',
          text: props.t('common.role'),
          csvText: props.t('common.role'),
          headerAlign: 'left',
          align: 'left',
          sort: false,
            formatter: (cell,row)=>{
            if(row?.userType==="secondaryUser"){
              return "Secondary User";
            }else{
              return "User";
            }
          },
          csvFormatter: userListNameCSV
        },
        {
          dataField: 'email',
          text: props.t('common.email'),
          csvText: props.t('common.email'),
          headerAlign: 'left',
          align: 'left',
          sort: true,
          hidden: true

        },
        {
          dataField: 'phoneNumber',
          text: props.t('common.phoneNumber'),
          csvText: props.t('common.phoneNumber'),
          csvType: Number,
          headerAlign: 'left',
          align: 'left',
          sort: true,
          formatter: phoneNumberFormatter,
          csvFormatter: (cell, row) => csvPhoneNumberFormatter(cell, row),
        },
        {
          dataField: 'accountNumber',
          text: props.t('common.accountNumber'),
          csvText: props.t('common.accountNumber'),
          // csvType: Number,
          headerAlign: 'left',
          align: 'left',
          sort: true,
          // formatter: phoneNumberFormatter,
          csvFormatter: csvSimpleFormatter,
        },
        {
          dataField: 'kycStatus',
          text: props.t('common.verified'),
          classes: "text-capitalize",
          csvText: props.t('common.verified'),
          headerAlign: 'left',
          align: 'left',
          sort: false,
          formatter: (cell, row) => statusKycFormatter(cell, row, this.onchangeKycStatus),
          csvFormatter: csvStatusKycFormatter,
        },
        {
          dataField: 'createdAt',
          text: props.t('common.registeredAt'),
          csvText: props.t('common.registeredAt'),
          csvType: Date,
          headerAlign: 'left',
          align: 'left',
          sort: true,
          formatter: dateFormatter,
          csvFormatter: csvDateFormatter,
        },
        {
          dataField: 'status',
          text: props.t('common.status'),
          classes: "text-capitalize",
          csvText: props.t('common.userStatus'),
          headerAlign: 'left',
          align: 'left',
          sort: false,
          formatter: (cell, row) => userStatusFormatter(cell, row, this.onchangeStatus, '', 'user')
        },
        {
          dataField: 'isDummyField',
          text: props.t('common.action'),
          csvExport: false,
          headerAlign: 'left',
          align: 'left',
          formatter: this.actionFormatter
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

  reloadList() {
    const query = this.props.location.search;
    this.reFetchOnUrlBasis(query);
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
          this.fetchUsers(queryParams)
        }
      )
    }
  }

  fetchUsers = async (
    queryParams = {
      offset: ((this.state.page - 1) * this.state.sizePerPage),
      limit: this.state.sizePerPage
    }
  ) => {
    queryParams = {
      ...queryParams,
      ...this.state.filterData,
      userType: 'allUser'
    }
    try {
      const payload = {
        ...ApiEndPoints.getUser,
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
          this.fetchUsers(queryParams)
        }
      }
    } else {
      this.fetchUsers(queryParams)
    }
  }

  /**
   * Local formatters
   */
  actionFormatter = (cell, row) => {
    const { t } = this.props
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
            to={{
              pathname: `/user-detail/${row.id}`
            }}
          >{t('common.view')}</Link>
          {/* <Link
            className={`dropdown-item ${(row.firstName && row.lastName) ? '' : 'btn disabled'}`}
            to=""
            onClick={(e) => {
              e.preventDefault()
              if (row.firstName && row.lastName) {
                this.showHideQrModal(row)
              }
            }}
          >{t('user.viewQR')}</Link> */}

          {/* <Link
            className={`dropdown-item ${(row.kycStatus !== 'pending') ? '' : 'btn disabled'}`}
            to=""
            onClick={(e) => {
              e.preventDefault()
              this.showHideKYCModal(row)
            }}
          >{t('user.viewKyc')}</Link> */}
        </div>
      </div>
    )
  };

  onchangeStatus = async (val, row, resHandleChange) => {
    try {
      let status = ''
      if (val === 'active') {
        status = 'active'
      } else {
        status = 'inactive'
      }

      const payload = {
        ...ApiEndPoints.updateStatusUser(row.id),
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
        dataTemp[indexData].status = status
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

  onchangeKycStatus = async (val, row, resHandleChange) => {
    try {
      let status = ''
      const payload = {
        ...ApiEndPoints.updateKycStatusUser(row.id),
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
        dataTemp[indexData].status = status
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

  onchangeUserTag = async (val, row, resHandleChange, columnName) => {
    try {
      let value = ''
      if (val) {
        value = 'true'
      } else {
        value = 'false'
      }

      const payload = {
        ...ApiEndPoints.updateUserTag,
        bodyData: {
          userId: row.id,
          columnName,
          value
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
        dataTemp[indexData][columnName] = value
      }
      this.setState({
        data: dataTemp
      })
      resHandleChange(value)
    } catch (error) {
      resHandleChange(row[columnName])
      logger({ 'error:': error })
    }
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
        this.fetchUsers()
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
      this.fetchUsers()
    })
  };

  showHideQrModal = (data = false) => {
    const { t } = this.props
    let qrData = {}
    let openQrModal = false
    if (data) {
      openQrModal = true
      qrData.title = `${data.firstName} ${data.lastName} : ${t('user.codeQR')}`
      qrData.img = data.qrCodeUrl
    }

    this.setState({
      qrData,
      openQrModal
    })
  }

  showHideKYCModal = (data = false) => {
    const { t } = this.props
    let kycData = {}
    let openKycModal = false
    if (data) {
      openKycModal = true
      kycData.title = `${data.firstName} ${data.lastName} : ${t('user.viewKyc')}`
      kycData.userId = data.id;
      kycData.kycStatus = data.kycStatus;
    }

    this.setState({
      kycData,
      openKycModal
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
      qrData,
      openQrModal,
      kycData,
      openKycModal
    } = this.state

    const { t } = this.props

    const noDataMessage = filterCount > 0 ? textMessages.noDataFound : textMessages.noDataUserList

    return (
      <>
        <MetaTags
          title={`${config.NAME_TITLE} | ${t('user.title')}`}
          description={`${t('user.title')} of ${config.NAME_TITLE}`}
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
                      name: t('user.title')
                    }
                  ]}
                />
                <h2 className='page-title text-capitalize mb-0'>
                  {t('user.title')}
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
                      <Form.Item name='accountNumber'>
                        <Input
                          className='form-control'
                          placeholder={t('common.accountNumber')}
                        />
                      </Form.Item>
                    </div>
                    <div className='form-group'>
                      <Form.Item name='status'>
                        <Select className='form-control' placeholder={t('common.status')}>
                          <Select.Option value=''>{t('common.allStatus')}</Select.Option>
                          <Select.Option value='active'>{t('common.active')}</Select.Option>
                          <Select.Option value='inactive'>{t('common.inactive')}</Select.Option>
                          {/* <Select.Option value='pending'>{t('common.pending')}</Select.Option> */}
                        </Select>
                      </Form.Item>
                    </div>
                    <div className='form-group'>
                      <Form.Item name='kycStatus'>
                        <Select className='form-control' placeholder={t('common.kycStatus')}>
                          <Select.Option value=''>{t('common.allKycStatus')}</Select.Option>
                          <Select.Option value='uploaded'>{t('common.pending')}</Select.Option>
                          <Select.Option value='pending'>{t('common.notUploaded')}</Select.Option>
                          <Select.Option value='approved'>{t('common.approved')}</Select.Option>
                          <Select.Option value='rejected'>{t('common.rejected')}</Select.Option>
                        </Select>
                      </Form.Item>
                    </div>
                    <div className='form-group form-group-date'>
                      <Form.Item name='createdAt'>
                        <DatePicker.RangePicker
                          placeholder={[t('common.registeredAtstartDate'), t('common.registeredAtendDate')]}
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
              checkUserPermission(this.props.userData, 'user') ?
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
                  fileName={`Monay_User_Listing_${currentDate()}.csv`}
                /> : <RemoteDataTable
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

                />}
          </div>
          {/* Show QR Code */}
          <ShowQR
            data={qrData}
            show={openQrModal}
            onHide={() => this.showHideQrModal()}
          />

          {/* Show KYC */}
          <ShowKyc
            data={kycData}
            show={openKycModal}
            reloadList={this.fetchUsers}
            onHide={() => this.showHideKYCModal()}
          />
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
ManageUser.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object,
  t: PropTypes.func.isRequired
}

export default withTranslation()(connect(mapStateToProps)(ManageUser))
