import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import RemoteDataTable from '../../components/dataTable'
import BreadCrumb from '../../components/breadCrumb'
import APIrequest from '../../services'
import { connect } from 'react-redux'
import {
  serialNumberFormatter,
  getPageSizeFromURL,
  addPageSizeInURL,
  titleCase,
  checkUserPermission
} from '../../utilities/common'
import MetaTags from '../../utilities/metaTags'
import ApiEndPoints from '../../utilities/apiEndPoints'
import textMessages from '../../utilities/messages'
import modalNotification from '../../utilities/notifications'
import logger from '../../utilities/logger'
import { withTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import config from '../../config'
import {
  updateQueryInURL
} from '../../utilities/common'
class ManageCms extends PureComponent {
  formRef = React.createRef();

  constructor(props) {
    super(props)

    this.state = {
      isFirstTimeFetching: true,
      intervalAddEditModal: false,
      editData: {},
      isLoading: true,
      deleteIntervalId: '',
      data: [],
      totalSize: 0,
      page: 1,
      sizePerPage: 10,
      userType: 'user',
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
          hidden: true
        },
        {
          dataField: 'isDummySno',
          text: props.t('common.sNo'),
          csvExport: false,
          formatter: (cell, row, rowIndex) => serialNumberFormatter(rowIndex, this.state.page, this.state.sizePerPage)
        },
        {
          dataField: 'pageName',
          text: props.t('cms.pageName'),
          headerAlign: 'left',
          align: 'left',
          sort: false,
        },
        // {
        //   dataField: 'userType',
        //   text: props.t('cms.userType'),
        //   headerAlign: 'left',
        //   align: 'left',
        //   sort: false,
        //   style: {
        //     textTransform: 'capitalize'
        //   }
        // },
        {
          dataField: 'isDummyField',
          text: props.t('common.action'),
          csvExport: false,
          headerAlign: 'left',
          align: 'left',
          classes: 'w_130 text-wrap',
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
          sizePerPage,
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
          this.fetchCMS(queryParams)
        }
      )
    }
  }

  fetchCMS = async (

    queryParams = {
      offset: ((this.state.page - 1) * this.state.sizePerPage),
      limit: this.state.sizePerPage,

    }
  ) => {
    queryParams = {
      ...queryParams,
      ...this.state.filterData,
      userType: this.state.userType
    }
    try {
      const payload = {
        ...ApiEndPoints.getCms,
        queryParams
      }
      const res = await APIrequest(payload)
      let faqData = [
        {
          createdAt: "",
          id: 99991,
          pageContent: "",
          pageKey: "faq",
          pageName: "FAQ",
          updatedAt: "",
          userType: this.state.userType,
        },
        // {
        //   createdAt: "",
        //   id: 99992,
        //   pageContent: "",
        //   pageKey: "faq",
        //   pageName: "FAQ",
        //   updatedAt: "",
        //   userType: "merchant",
        // }
      ]
      this.setState({
        isLoading: false,
        isFirstTimeFetching: false,
        data: [...res.data.rows, ...faqData],
        totalSize: res.data.rows.length > 0 ? (res.data.count + 1) || (res.data.rows.length + 1) : 0
      })

      if (this.state.page > 1 && this.state.data.length < 1) {
        this.setState(prevState => {
          return {
            page: prevState.page - 1,
            isLoading: true,
            data: [],
            totalSize: 0
          }
        }, () => {
          if (!this.state.isFirstTimeFetching) {
            addPageSizeInURL(this.state.page, this.state.sizePerPage, this.props.history)
          }
          this.fetchCMS()
        })
      }
    } catch (error) {
      logger({ 'error:': error })
    }
  };

  handleTabChange = (value) => {
    this.setState(
      {
        page: 1,
        sizePerPage: 10,
        isLoading: true,
        data: [],
        totalSize: 0,
        userType: value
      }, () => {
        this.fetchCMS()
      }
    )
  }
  /**
   * Local formatters
   */
  actionFormatter = (cell, row) => {
    if (row.pageKey === 'faq') {
      return (
        <>{checkUserPermission(this.props.userData, 'cms') ? <Link
          className="pencilBtn"
          to={{
            pathname: `/faq`,
            search: `?user_type=${row.userType}`
          }}
        ><i className="icon-create"></i></Link> : "-"}</>
      )
    } else {
      return (
        <>{checkUserPermission(this.props.userData, 'cms') ? <Link
          className="pencilBtn"
          to={{ pathname: `/cms/${row.id}` }}
        ><i className="icon-create"></i></Link> : "-"}</>

      )
    }
  };

  /**
   * To handle the DataTable on change
   */
  handleTableChange = (
    type,
    { page, sizePerPage, userType, filters, sortField, sortOrder, cellEdit }
  ) => {
    this.setState(
      {
        page,
        sizePerPage,
        isLoading: true,
        data: [],
        totalSize: 0,

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
          this.fetchCMS(queryParams)
        }
      }
    } else {
      this.fetchCMS(queryParams)
    }
  }

  messageFormatter = (cell, row) => {
    return cell.replace('{name}', titleCase(row.User.name))
  }

  onchangeStatus = async (val, row, resHandleChange) => {
    try {
      let status = ''
      if (val) {
        status = 'active'
      } else {
        status = 'inactive'
      }

      const payload = {
        ...ApiEndPoints.updateStatusInterval(row.id),
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

  render() {
    const {
      data,
      totalSize,
      page,
      sizePerPage,
      defaultSorted,
      columns,
      isLoading
    } = this.state

    const { t } = this.props

    const noDataMessage = textMessages.noDataIntervalList

    return (
      <>
        <MetaTags
          title={`${config.NAME_TITLE} | ${t('cms.title')}`}
          description={`${t('cms.title')} of ${config.NAME_TITLE}`}
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
                      name: t('cms.title')
                    }
                  ]}
                />
                <h2 className='page-title text-capitalize mb-0'>
                  {t('cms.title')}
                </h2>
              </div>
              <div className='right-side'>
              </div>
            </div>
            <div className="viewBox settingContent bg-white pb-0 custom-tabs">
              <ul className="nav nav-tabs" id="myTab" role="tablist">
                <li className="nav-item">
                  <a className="nav-link active" id="user-cms-tab" data-toggle="tab" href="#user-cms" role="tab" aria-controls="user-cms" aria-selected="true"
                    onClick={(e) => {
                      e.preventDefault()
                      updateQueryInURL(this.props.history, { userType: 'user' })
                      setTimeout(() => {
                        this.handleTabChange('user')
                      }, 1000 / 2)
                    }}>
                    {t('user.title')}
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" id="merchant-cms-tab" data-toggle="tab" href="#merchant-cms" role="tab" aria-controls="merchant-cms" aria-selected="false"
                    onClick={(e) => {
                      e.preventDefault()
                      updateQueryInURL(this.props.history, { userType: 'merchant' })
                      setTimeout(() => {
                        this.handleTabChange('merchant')
                      }, 1000 / 2)
                    }}>
                    {t('merchant.title')}
                  </a>
                </li>
              </ul>
            </div>
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
              showPagination={false}
            />
          </div>
        </main>
      </>
    )
  }
}

ManageCms.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object,
  t: PropTypes.func.isRequired
}

const mapStateToProps = (state) => {
  return {
    userData: state.auth.userData || ''
  }
}
export default withTranslation()(connect(mapStateToProps)(ManageCms))