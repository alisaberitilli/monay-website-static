import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import RemoteDataTable from '../../components/dataTable'
import BreadCrumb from '../../components/breadCrumb'
import APIrequest from '../../services'
import {
  dateFormatter,
  serialNumberFormatter,
  getPageSizeFromURL,
  addPageSizeInURL,
  titleCase,
  getNotificationMessage
} from '../../utilities/common'
import MetaTags from '../../utilities/metaTags'
import ApiEndPoints from '../../utilities/apiEndPoints'
import textMessages from '../../utilities/messages'
import modalNotification from '../../utilities/notifications'
import logger from '../../utilities/logger'
import { withTranslation } from 'react-i18next'
import config from '../../config'
import { Link } from 'react-router-dom'

class Notification extends PureComponent {
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
          formatter: (cell, row, rowIndex) => serialNumberFormatter(rowIndex, this.state.page, this.state.sizePerPage)
        },
        {
          dataField: 'message',
          text: props.t('common.message'),
          headerAlign: 'left',
          align: 'left',
          sort: false,
          formatter: getNotificationMessage
        },
        {
          dataField: 'createdAt',
          text: props.t('common.dateTime'),
          headerAlign: 'left',
          align: 'left',
          sort: false,
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
          this.fetchNotification(queryParams)
        }
      )
    }
  }

  fetchNotification = async (
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
        ...ApiEndPoints.getNotification,
        queryParams
      }
      const res = await APIrequest(payload)
      this.setState({
        isLoading: false,
        isFirstTimeFetching: false,
        data: res.data.rows,
        totalSize: res.data.rows.length > 0 ? res.data.count : 0
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
          this.fetchNotification()
        })
      }
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
          this.fetchNotification(queryParams)
        }
      }
    } else {
      this.fetchNotification(queryParams)
    }
  }

  /**
   * Local Formatter
   */
  actionFormatter = (cell, row) => {
    return (
      <div className='dropdown'>
        <a
          href='/'
          onClick={(e) => e.preventDefault()}
          className='dropdown-toggle'
          id={`dropdownMenuButton_${row.id}`}
          data-toggle='dropdown'
          aria-haspopup='true'
          aria-expanded='false'
        >
          <span className='icon-more'></span>
        </a>
        <div className='dropdown-menu' aria-labelledby='dropdownMenuButton'>

        </div>
      </div>
    )
  };

  messageFormatter = (cell, row) => {
    let replaceWith = '-'
    if (
      row &&
      row.User &&
      row.User.firstName &&
      row.User.lastName
    ) {
      replaceWith = `${titleCase(row.User.firstName)} ${titleCase(row.User.lastName)}`
    }

    if (row.type === 'NEW_USER') {
      if (row.User.userType === 'user') {
        replaceWith = cell.replace('{name}', replaceWith)
      } else if (row.User.userType === 'merchant') {
        replaceWith = cell.replace('{name}', <Link to="/manage-merchant">${replaceWith}</Link>)
      }
    }
    return <div>${replaceWith}</div>
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
          title={`${config.NAME_TITLE} | ${t('notification.title')}`}
          description={`${t('notification.title')} of ${config.NAME_TITLE}`}
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
                      name: t('notification.title')
                    }
                  ]}
                />
                <h2 className='page-title text-capitalize mb-0'>
                  {t('notification.title')}
                </h2>
              </div>
              <div className='right-side'>
              </div>
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
            />
          </div>
        </main>
      </>
    )
  }
}

Notification.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object,
  t: PropTypes.func.isRequired
}

export default withTranslation()(Notification)
