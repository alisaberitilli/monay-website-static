import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import RemoteDataTable from '../../components/dataTable'
import BreadCrumb from '../../components/breadCrumb'
import APIrequest from '../../services'
import { Link } from 'react-router-dom'
import {

  dateFormatter,
  dateFormatDMY,
  serialNumberFormatter,
  getPageSizeFromURL,
  addPageSizeInURL,
  filterDataObj
} from '../../utilities/common'
import { Form, Input, Button, DatePicker } from 'antd'
import MetaTags from '../../utilities/metaTags'
import ApiEndPoints from '../../utilities/apiEndPoints'
import modalNotification from '../../utilities/notifications'
import textMessages from '../../utilities/messages'
import logger from '../../utilities/logger'
import { withTranslation } from 'react-i18next'
import config from '../../config'
import moment from "moment";

class ManageRole extends PureComponent {
  formRef = React.createRef();

  constructor(props) {
    super(props)

    this.state = {
      isFirstTimeFetching: true,
      categoryAddEditModal: false,
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
          dataField: 'role',
          text: props.t('role.name'),
          align: 'left',
          sort: true,
          style: {
            textTransform: 'capitalize'
          }
        },
        {
          dataField: 'createdAt',
          text: props.t('common.createdOn'),
          headerAlign: 'left',
          align: 'left',
          sort: true,
          formatter: dateFormatter
        },
        // {
        //   dataField: 'updatedAt',
        //   text: props.t('common.updatedAt'),
        //   headerAlign: 'left',
        //   align: 'left',
        //   sort: true,
        //   formatter: dateFormatter
        // },
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
          this.fetchRoles(queryParams)
        }
      )
    }
  }

  fetchRoles = async (
    queryParams = {
      offset: ((this.state.page - 1) * this.state.sizePerPage),
      limit: this.state.sizePerPage
    }
  ) => {
    queryParams = {
      ...queryParams,
      ...this.state.filterData
    }
    try {
      const payload = {
        ...ApiEndPoints.getRole,
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
          this.fetchRoles(queryParams)
        }
      }
    } else {
      this.fetchRoles(queryParams)
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
              pathname: `/edit-role/${row.id}`,
            }}
          >{t('common.edit')}</Link>

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
        ...ApiEndPoints.updateStatusCategory(row.id),
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

  roleAddEdit = (row = {}) => {
    this.setState(
      {
        editData: row
      },
      () => {
        this.handleToggle('categoryAddEditModal')
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
        this.fetchRoles()
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
      this.fetchRoles()
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

    const noDataMessage = filterCount > 0 ? textMessages.noDataFound : textMessages.noDataRoleList

    return (
      <>
        <MetaTags
          title={`${config.NAME_TITLE} | ${t('role.roleTitle')}`}
          description={`${t('role.roleTitle')} of ${config.NAME_TITLE}`}
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
                      name: t('role.roleTitle')
                    }
                  ]}
                />
                <h2 className='page-title text-capitalize mb-0'>
                  {t('role.roleTitle')}
                </h2>
              </div>
              <div className='right-side d-flex'>
                <a aria-controls="filterSection" aria-expanded="false" className="btn btn-primary ripple-effect d-lg-none collapsed btnFilter" data-toggle="collapse" href="#filterSection" id="filterbtn" role="button">
                  <i className="icon-filter1"></i>
                </a>
                <div className='btnBox d-flex w-100'>
                  <Link
                    to='/add-role'
                    className='text-white btn btn-primary width-120 ripple-effect text-uppercase mr-2 d-flex align-item-cente'
                  >
                    {t('role.add')}
                  </Link>
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
                    status: '',
                    kycStatus: ''
                  }}
                >
                  <div className="form_field d-flex flex-wrap align-items-center">
                    <div className='form-group'>
                      <Form.Item name='role'>
                        <Input
                          className='form-control'
                          placeholder={t('role.name')}
                        />
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

      </>
    )
  }
}

ManageRole.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object,
  t: PropTypes.func.isRequired
}

export default withTranslation()(ManageRole)
