import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import MetaTags from '../../utilities/metaTags'
import APIrequest from '../../services'
import SkeletonButton from 'antd/lib/skeleton/Button'
import ApiEndPoints from '../../utilities/apiEndPoints'
import { numberFormatter, lastWeekPercent, checkUserPermission, userListNameCSV } from '../../utilities/common'
import logger from '../../utilities/logger'
import config from '../../config'
import { Link } from 'react-router-dom'
import RecentData from '../../components/recentData/index'
import ApexDonutGraph from '../../components/graph/apexDonutGraph'
import ApexDashedGraph from '../../components/graph/apexDashedGraph'
import { connect } from 'react-redux'

class Dashboard extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      isLoading: true,
      data: {},
    }
  }

  componentDidMount() {
    this.loadData()
  }

  loadData = async () => {
    try {
      const payload = {
        ...ApiEndPoints.dashboard
      }
      const res = await APIrequest(payload)
      this.setState({
        isLoading: false,
        data: res.data
      })
    } catch (error) {
      logger({ 'error:': error })
    }
  };


  render() {
    const { isLoading, data } = this.state
    const { t } = this.props
    return (
      <>
        <MetaTags
          title={`${config.NAME_TITLE} | ${t('dashboard.title')}`}
          description={`${t('dashboard.title')} of ${config.NAME_TITLE}`}
        />
        <main className='main-content admin-dashboard'>
          <div className='container-fluid'>

            <div className="page-title-row">
              <div className="left-side">
                <h1 className="page-title text-capitalize mb-0">
                  {t('dashboard.title')}
                </h1>
              </div>
            </div>
            {
              checkUserPermission(this.props.userData, 'dashboard') ? <>
                <div className="row dashboardRow">
                  <div className="col-6 col-sm-6 col-md-4 col-lg-4 col-xl-3 column">
                    <Link
                      to='/manage-user'
                    >
                      <div className="count-item bg-white d-flex align-items-center">
                        <div className="count w-100">
                          <label className="font-sm">{t('dashboard.totalUsers')}</label>
                          <h3 className="font-bd mb-0">{isLoading ? (
                            <SkeletonButton active />
                          ) : (
                              numberFormatter(data.total_users)
                            )}</h3>
                          <div className="info">
                            {lastWeekPercent(data.total_last_week_users, data.total_current_week_users)}
                            {/* <span className="change up"><i className="icon icon-arrow-up2"></i>4.63%</span>
                        <span> vs. last week</span> */}
                          </div>
                        </div>
                        <i className="icon-users icon"></i>
                      </div>
                    </Link>
                  </div>
                  <div className="col-6 col-sm-6 col-md-4 col-lg-4 col-xl-3 column">
                    <Link
                      to='/manage-merchant'
                    >
                      <div className="count-item bg-white d-flex align-items-center">
                        <div className="count w-100">
                          <label className="font-sm">{t('dashboard.totalMerchants')}</label>
                          <h3 className="font-bd mb-0">{isLoading ? (
                            <SkeletonButton active />
                          ) : (
                              numberFormatter(data.total_merchant)
                            )}</h3>
                          <div className="info">
                            {lastWeekPercent(data.total_last_week_merchant, data.total_current_week_merchant)}
                          </div>
                        </div>
                        <i className="icon-merchants icon"></i>
                      </div>
                    </Link>
                  </div>
                  <div className="col-6 col-sm-6 col-md-4 col-lg-4 col-xl-3 column">
                    <Link
                      to='/withdrawal-transaction'
                    >
                      <div className="count-item bg-white d-flex align-items-center">

                        <div className="count w-100">
                          <label className="font-sm">{t('transaction.totalWithdrawalTransaction')}</label>
                          <h3 className="font-bd mb-0">{isLoading ? (
                            <SkeletonButton active />
                          ) : (
                              numberFormatter(data.withdrawal_request)
                            )}</h3>
                          <div className="info">
                            {lastWeekPercent(data.withdrawal_lastweek_request, data.withdrawal_currentweek_request)}
                          </div>
                        </div>
                        <i className="icon-withdraw-request icon"></i>
                      </div>
                    </Link>
                  </div>
                  <div className="col-6 col-sm-6 col-md-4 col-lg-4 col-xl-3 column">
                    <Link
                      to='/withdrawal-transaction?paymentStatus=pending'
                    >
                      <div className="count-item bg-white d-flex align-items-center">
                        <div className="count w-100">
                          <label className="font-sm">{t('transaction.withdrawalPendingTransaction')}</label>
                          <h3 className="font-bd mb-0">{isLoading ? (
                            <SkeletonButton active />
                          ) : (
                              numberFormatter(data.withdrawal_pending_request)
                            )}</h3>
                          <div className="info">
                            {lastWeekPercent(data.withdrawal_pending_lastweek_request, data.withdrawal_pending_currentweek_request)}
                          </div>
                        </div>
                        <i className="icon-pending-withdraw icon"></i>
                      </div>
                    </Link>
                  </div>
                  <div className="col-6 col-sm-6 col-md-4 col-lg-4 col-xl-3 column">
                    <Link
                      to='/payment-request'
                    >
                      <div className="count-item bg-white d-flex align-items-center">

                        <div className="count w-100">
                          <label className="font-sm">{t('transaction.paymentRequest')}</label>
                          <h3 className="font-bd mb-0">{isLoading ? (
                            <SkeletonButton active />
                          ) : (
                              numberFormatter(data.payment_request)
                            )}</h3>
                          <div className="info">
                            {lastWeekPercent(data.payment_lastweek_request, data.payment_currentweek_request)}
                          </div>
                        </div>
                        <i className="icon-payment-request icon"></i>
                      </div>
                    </Link>
                  </div>
                  <div className="col-6 col-sm-6 col-md-4 col-lg-4 col-xl-3 column">
                    <div className="count-item bg-white d-flex align-items-center">
                      <div className="count w-100">
                        <label className="font-sm">{t('dashboard.totalTransactions')}</label>
                        <h3 className="font-bd mb-0">{isLoading ? (
                          <SkeletonButton active />
                        ) : (
                            numberFormatter(data.total_transaction_count)
                          )}</h3>
                        <div className="info">
                          {lastWeekPercent(data.total_transaction_lastweek_count, data.total_transaction_currentweek_count)}
                        </div>
                      </div>
                      <i className="icon-transactions icon"></i>
                    </div>
                  </div>
                  <div className="col-6 col-sm-6 col-md-4 col-lg-4 col-xl-3 column">
                    <Link
                      to='/successful-transaction'
                    >
                      <div className="count-item bg-white d-flex align-items-center">
                        <div className="count w-100">
                          <label className="font-sm">{t('dashboard.successfulTransaction')}</label>
                          <h3 className="font-bd mb-0">{isLoading ? (
                            <SkeletonButton active />
                          ) : (
                              numberFormatter(data.success_transaction_count)
                            )}</h3>
                          <div className="info">
                            {lastWeekPercent(data.success_transaction_lastweek_count, data.success_transaction_currentweek_count)}
                          </div>
                        </div>
                        <i className="icon-success icon"></i>
                      </div>
                    </Link>
                  </div>
                  <div className="col-6 col-sm-6 col-md-4 col-lg-4 col-xl-3 column">
                    <Link
                      to='/failed-transaction'
                    >
                      <div className="count-item bg-white d-flex align-items-center">
                        <div className="count w-100">
                          <label className="font-sm">{t('dashboard.failedTransaction')}</label>
                          <h3 className="font-bd mb-0">{isLoading ? (
                            <SkeletonButton active />
                          ) : (
                              numberFormatter(data.faild_transaction_count)
                            )}</h3>
                          <div className="info">
                            {lastWeekPercent(data.faild_transaction_lastweek_count, data.faild_transaction_currentweek_count)}
                          </div>
                        </div>
                        <i className="icon-failed icon"></i>
                      </div>
                    </Link>
                  </div>
                </div>
                <div className="row dashboardRow mb-4">
                  <div className="col-xl-8 col-lg-6">
                    <div className="card graphCard border-0 bg-white">
                      {/* <div className="card-header border-0 bg-white">
                    <h4 className="graphCard__title font-sm mb-0">{t('dashboard.statistics')}</h4>
                  </div> */}
                      <div className="card-body">
                        <div className="graphCard__graph">
                          <ApexDashedGraph t={t} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-lg-6">
                    {
                      (isLoading) ? '' : <ApexDonutGraph t={t} />
                    }
                  </div>
                </div>
                <div className="row recent-page dashboardRow">
                  <div className="col-md-6">
                    <RecentData
                      title={t('common.recentUser')}
                      path="manage-user"
                      type="user"
                      t={this.props.t}
                    />
                  </div>
                  <div className="col-md-6">
                    <RecentData
                      title={t('common.recentMerchant')}
                      path="manage-merchant"
                      type="merchant"
                      t={this.props.t}
                    />
                  </div>
                </div>
              </>
                : <>
                  <div class="card-header text-center border-0"><h4 class="mb-0 text-capitalize">{t('dashboard.welcome')} {userListNameCSV({}, this.props.userData)} </h4></div>
                </>}


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

Dashboard.propTypes = {
  t: PropTypes.func.isRequired,
  i18n: PropTypes.object.isRequired
}

export default withTranslation()(connect(mapStateToProps)(Dashboard))