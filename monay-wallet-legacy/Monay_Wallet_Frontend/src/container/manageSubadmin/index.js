import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import RemoteDataTable from '../../components/dataTable'
import BreadCrumb from '../../components/breadCrumb'
import APIrequest from '../../services'
import {
  statusFormatter,
  dateFormatter,
  dateFormatDMY,
  serialNumberFormatter,
  getPageSizeFromURL,
  addPageSizeInURL,
  filterDataObj,
  userListName,
  csvPhoneNumberFormatter,
  phoneNumberFormatter
} from '../../utilities/common'
import { Form, Select, Input, Button, DatePicker } from 'antd'
import MetaTags from '../../utilities/metaTags'
import ApiEndPoints from '../../utilities/apiEndPoints'
import modalNotification from '../../utilities/notifications'
import textMessages from '../../utilities/messages'
import SubadminAddEdit from '../../components/modals/subadminAddEdit'
import logger from '../../utilities/logger'
import { withTranslation } from 'react-i18next'
import config from '../../config'
import { connect } from 'react-redux'
import { addUserRolesAction } from '../../redux/common/commonSlice'
import { addRolesAction } from '../../redux/common/commonSlice'
import moment from "moment";
class ManageSubadmin extends PureComponent {
  formRef = React.createRef();

  constructor(props) {
    super(props)

    this.state = {
      isFirstTimeFetching: true,
      subadminAddEditModal: false,
      managePreferencesModal: false,
      editData: {},
      filterData: {},
      filterCount: 0,
      isLoading: true,
      data: [],
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
          dataField: 'isDummyName',
          text: props.t('common.name'),
          csvText: props.t('common.name'),
          headerAlign: 'left',
          align: 'left',
          sort: true,
          formatter: userListName,
          // csvFormatter: userListNameCSV
        },
        {
          dataField: 'email',
          text: props.t('subadmin.email'),
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
          dataField: 'UserRole.role',
          text: props.t('role.title'),
          headerAlign: 'left',
          align: 'left',
          style: {
            textTransform: 'capitalize'
          }
        },
        {
          dataField: 'status',
          text: props.t('common.status'),
          headerAlign: 'left',
          align: 'left',
          formatter: (cell, row) => statusFormatter(cell, row, this.onchangeStatus)
        },
        {
          dataField: 'createdAt',
          text: props.t('common.createdOn'),
          headerAlign: 'left',
          align: 'left',
          sort: true,
          formatter: dateFormatter
        },
        {
          dataField: 'isDummyField',
          text: props.t('common.action'),
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
          this.fetchSubadmin(queryParams)
        }
      )
    }
  }

  fetchSubadmin = async (
    queryParams = {
      offset: ((this.state.page - 1) * this.state.sizePerPage),
      limit: this.state.sizePerPage,
      sortBy: this.state.defaultSorted[0].dataField,
      sortType: this.state.defaultSorted[0].order
    }
  ) => {
    queryParams = {
      ...queryParams,
      ...this.state.filterData
    }
    try {
      const payload = {
        ...ApiEndPoints.getSubadmin,
        queryParams
      }
      let roleQuery = { listType: 'all' };
      const rolePayload = {
        ...ApiEndPoints.getRole,
        queryParams: roleQuery
      }

      const res = await APIrequest(payload)
      const roleRes = await APIrequest(rolePayload)
      this.setState({
        isLoading: false,
        isFirstTimeFetching: false,
        data: res.data.rows,
        totalSize: res.data.rows.length > 0 ? res.data.total : 0
      })
      this.props.addUserRolesRedux(res.data.roles)
      this.props.addRolesRedux(roleRes.data.rows)
    } catch (error) {
      logger({ 'error:': error })
    }
  };

  handleToggle = (stateName) => {
    this.setState((state) => {
      return {
        [stateName]: !state[stateName]
      }
    })
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
          this.fetchSubadmin(queryParams)
        }
      }
    } else {
      this.fetchSubadmin(queryParams)
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
          <a
            className='dropdown-item'
            href='/'
            onClick={(e) => {
              e.preventDefault()
              this.approverAddEdit(row)
            }}
          >
            {t('common.edit')}
          </a>

        </div>
      </div>
    )
  };

  onchangeStatus = async (val, row, resHandleChange) => {
    try {
      let status = ''
      if (val) {
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

  approverAddEdit = (row = {}) => {
    this.setState(
      {
        editData: row
      },
      () => {
        this.handleToggle('subadminAddEditModal')
      }
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
        this.fetchSubadmin()
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
      this.fetchSubadmin()
    })
  };

  render() {
    const {
      subadminAddEditModal,
      editData,
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

    const noDataMessage = filterCount > 0 ? textMessages.noDataFound : textMessages.noDataApproverList

    return (
      <>
        <MetaTags
          title={`${config.NAME_TITLE} | ${t('subadmin.title')}`}
          description={`${t('subadmin.title')} of ${config.NAME_TITLE}`}
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
                      name: t('subadmin.title')
                    }
                  ]}
                />
                <h2 className='page-title text-capitalize mb-0'>
                  {t('subadmin.title')}
                </h2>
              </div>
              <div className='right-side d-flex'>
                <a aria-controls="filterSection" aria-expanded="false" className="btn btn-primary ripple-effect d-lg-none collapsed btnFilter" data-toggle="collapse" href="#filterSection" id="filterbtn" role="button">
                  <i className="icon-filter1"></i>
                </a>
                <div className='btnBox d-flex w-100'>
                  <button
                    href='/'
                    onClick={(e) => {
                      e.preventDefault()
                      this.approverAddEdit()
                    }}
                    className='ant-btn btn btn-primary width-120 ripple-effect text-uppercase mr-2'
                  >
                    {t('subadmin.add')}
                  </button>
                </div>
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
                    role: '',
                  }}
                >
                  <div className="form_field d-flex flex-wrap align-items-center">
                    <div className='form-group'>
                      <Form.Item name='name'>
                        <Input
                          className='form-control'
                          placeholder={t('subadmin.name')}
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
                      <Form.Item name='role'>
                        <Input
                          className='form-control'
                          placeholder={t('role.title')}
                        />
                      </Form.Item>
                    </div>
                    <div className='form-group'>
                      <Form.Item name='status'>
                        <Select className='form-control' placeholder={t('common.status')}>
                          <Select.Option value=''>{t('common.allStatus')}</Select.Option>
                          <Select.Option value='active'>{t('common.active')}</Select.Option>
                          <Select.Option value='inactive'>{t('common.inactive')}</Select.Option>
                        </Select>
                      </Form.Item>
                    </div>



                    <div className='form-group form-group-date'>
                      <Form.Item name='createdAt'>
                        <DatePicker.RangePicker
                          placeholder={[t('common.createdAtStartDate'), t('common.createdAtendDate')]}
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
              // selectRow={{}}
              defaultSorted={defaultSorted}
              loading={isLoading}
              noDataMessage={noDataMessage}
            />
          </div>

        </main>
        {/* Add/Edit subadmin */}
        <SubadminAddEdit
          show={subadminAddEditModal}
          data={editData}
          onSubmitSuccess={this.fetchSubadmin}
          onHide={() => this.approverAddEdit()}
        />
      </>
    )
  }
}

const mapStateToProps = (state) => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {
    addUserRolesRedux: (res) => dispatch(addUserRolesAction(res)),
    addRolesRedux: (res) => dispatch(addRolesAction(res)),
  }
}

ManageSubadmin.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object,
  t: PropTypes.func.isRequired,
  addUserRolesRedux: PropTypes.func.isRequired,
  addRolesRedux: PropTypes.func.isRequired,
}

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(ManageSubadmin))
