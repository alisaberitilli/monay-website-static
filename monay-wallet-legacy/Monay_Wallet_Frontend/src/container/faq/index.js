import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import BreadCrumb from '../../components/breadCrumb'
import { connect } from 'react-redux'
import APIrequest from '../../services'
import LoadingView from '../../components/loadingView'
import ApiEndPoints from '../../utilities/apiEndPoints'
import { Pagination, Alert } from 'antd'
import MetaTags from '../../utilities/metaTags'
import DeleteConfirmation from '../../components/modals/deleteConfirmation'
import logger from '../../utilities/logger'
import {
  getPageSizeFromURL,
  addPageSizeInURL,
  titleCase
} from '../../utilities/common'
import { withTranslation } from 'react-i18next'
import config from '../../config'
import textMessages from '../../utilities/messages'

export class Faq extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      userType: 'user',
      isFirstTimeFetching: true,
      isLoading: true,
      error: false,
      deleteFAQModal: false,
      deleteFAQId: '',
      data: [],
      totalSize: 0,
      page: 1,
      sizePerPage: 10
    }
  }

  componentDidMount() {
    if (this.props.location && this.props.location.search) {
      const query = this.props.location.search
      this.reFetchOnUrlBasis(query)
    } else {
      this.fetchFaqs()
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
    const res = getPageSizeFromURL(query, location, true)
    const setStateVal = {
      isLoading: true,
      data: [],
      totalSize: 0
    }
    if (res) {
      const {
        data: {
          page,
          sizePerPage
        },
        user_type: userType
      } = res
      if (
        page &&
        sizePerPage
      ) {
        setStateVal.page = page
        setStateVal.sizePerPage = sizePerPage
      }

      if (userType) {
        setStateVal.userType = userType
      }
      this.setState(
        setStateVal, () => {
          this.fetchFaqs()
        }
      )
    }
  }

  fetchFaqs = async (
    queryParams = {
      offset: ((this.state.page - 1) * this.state.sizePerPage),
      limit: this.state.sizePerPage
    }
  ) => {
    try {
      queryParams = {
        ...queryParams,
        userType: this.state.userType
      }
      const payload = {
        ...ApiEndPoints.getFaq,
        queryParams
      }
      const res = await APIrequest(payload)
      this.setState({
        isLoading: false,
        isFirstTimeFetching: false,
        error: false,
        data: res.data.rows,
        totalSize: res.data.rows.length > 0 ? res.data.total : 0
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
          this.fetchFaqs()
        })
      }
    } catch (error) {
      logger({ 'error:': error })
      this.setState({
        isLoading: false,
        error: true
      })
    }
  };

  deleteFAQ = async (id) => {
    this.showHideDeleteFAQ(id)
  }

  showHideDeleteFAQ = (id = '') => {
    this.setState(
      {
        deleteFAQId: id
      },
      () => {
        this.handleToggle('deleteFAQModal')
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

  handlePagination = (page) => {
    this.setState(
      {
        page,
        isLoading: true
      },
      () => {
        if (!this.state.isFirstTimeFetching) {
          addPageSizeInURL(this.state.page, this.state.sizePerPage, this.props.history)
        }
        this.fetchOnHandleTableChange()
      }
    )
  };

  fetchOnHandleTableChange = () => {
    if (this.state.isFirstTimeFetching) {
      const { location } = this.props

      if (location) {
        const query = location.search
        const res = getPageSizeFromURL(query, location)
        if (res) {
          this.reFetchOnUrlBasis(query)
        } else {
          this.fetchFaqs()
        }
      }
    } else {
      this.fetchFaqs()
    }
  }

  render() {
    const {
      data,
      totalSize,
      userType,
      page,
      sizePerPage,
      isLoading,
      deleteFAQId,
      deleteFAQModal
    } = this.state
    const { t } = this.props

    if (isLoading) {
      return <LoadingView />
    }

    return (
      <>
        <MetaTags
          title={`${config.NAME_TITLE} | ${t('faq.title')}`}
          description={`${t('faq.title')} of ${config.NAME_TITLE}`}
        />
        <main className='main-content faq-page'>
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
                      name: t('faq.title')
                    }
                  ]}
                />
                <h2 className='page-title text-capitalize'>
                  {t('faq.title')} ({titleCase(userType)})
                </h2>
              </div>
              <div className='right-side'>
                <Link
                  to={{
                    pathname: `/add-faq`,
                    search: `?user_type=${userType}`
                  }}
                  className='btn btn-primary mobile-btn ripple-effect text-uppercase min-w130'
                >
                  {t('faq.add')}
                </Link>
              </div>
            </div>

            {/* <!-- page title section end --> */}
            {
              data.length > 0 ? <div className='common-box'>
                <div className='accordion' id='accordion'>
                  {
                    data.map((data, idx) => {
                      return (
                        <div className='card' key={idx}>
                          <div className='card-header' id={`heading${idx}`}>
                            <button
                              className='btn btn-link'
                              type='button'
                              data-toggle='collapse'
                              data-target={`#question${idx}`}
                              aria-expanded='false'
                              aria-controls={`question${idx}`}
                            >
                              <span></span> {data.question}
                            </button>
                            <ul className='list-inline right-cnt mb-0'>
                              <li className='list-inline-item'>
                                <Link
                                  to={{
                                    pathname: `/edit-faq/${data.id}`,
                                    search: `?user_type=${userType}`,
                                    state: data
                                  }}
                                >
                                  <i className='icon-edit'></i>
                                </Link>
                              </li>
                              <li className='list-inline-item'>
                                <Link
                                  to='/'
                                  onClick={(e) => {
                                    e.preventDefault()
                                    this.deleteFAQ(data.id)
                                  }}
                                >
                                  <i className='icon-bin fontw-bd'></i>
                                </Link>
                              </li>
                            </ul>
                          </div>
                          <div
                            id={`question${idx}`}
                            className='collapse'
                            aria-labelledby={`heading${idx}`}
                            data-parent='#accordion'
                          >
                            <div className='card-body'>
                              <p className='mb-0'>{data.answer}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  }
                </div>
              </div> : <div className='card'>
                  <div className='card-header'>
                    <Alert
                      className="mb-0"
                      message={textMessages.noDataFaqList}
                      type='error'
                    />
                  </div>
                </div>
            }
            <DeleteConfirmation
              show={deleteFAQModal}
              id={Number(deleteFAQId)}
              type="faq"
              onSubmitSuccess={this.fetchFaqs}
              onHide={() => this.showHideDeleteFAQ()}
            />
            {/* <!-- pagination start --> */}
            {data.length > 0 && (
              <div className='common-pagination d-flex justify-content-end'>
                <nav className='pagination-item'>
                  <Pagination
                    defaultCurrent={page}
                    defaultPageSize={sizePerPage}
                    onChange={this.handlePagination}
                    total={totalSize}
                  />
                </nav>
              </div>
            )}
            {/* <!-- pagination end --> */}
          </div>
        </main>
      </>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    ...state
  }
}

const mapDispatchToProps = (dispatch) => {
  return {}
}

Faq.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object,
  t: PropTypes.func.isRequired
}

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(Faq))
