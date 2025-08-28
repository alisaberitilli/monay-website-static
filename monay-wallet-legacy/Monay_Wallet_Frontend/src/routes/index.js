import React, { PureComponent, Suspense, lazy } from 'react'
import { connect } from 'react-redux'
import { Switch, Router } from 'react-router-dom'
import RouteWithLayout from './routeWithLayout'
import browserHistory from '../utilities/browserHistory'
import WithAuth from '../utilities/withAuth'
import MainLayout from '../layouts/main'
import LoginLayout from '../layouts/login'
import FullPageLoader from '../components/loadingView/fullPageLoader'
import LoadingView from '../components/loadingView'
const NotFound = lazy(() => import('../container/notFound'))
const Home = lazy(() => import('../container/home'))
const Dashboard = lazy(() => import('../container/dashboard'))
const ManageUser = lazy(() => import('../container/manageUser'))
const ScrollToTop = lazy(() => import('../components/scrollToTop'))
const ResetPassword = lazy(() => import('../container/resetPassword'))
const NetworkDetector = lazy(() => import('../components/networkDetector'))
const ManageMerchant = lazy(() => import('../container/manageMerchant'))
const ActivityLog = lazy(() => import('../container/activityLog'))
const Settings = lazy(() => import('../container/settings'))
const UserDetail = lazy(() => import('../container/userDetails'))
const Notification = lazy(() => import('../container/notification'))
const ManageCms = lazy(() => import('../container/manageCms'))
const Cms = lazy(() => import('../container/cms'))
const PendingRequest = lazy(() => import('../container/pendingRequest'))
const ClosedRequest = lazy(() => import('../container/closedRequest'))
const ChangePasswordRoute = lazy(() => import('../container/changePassword'))
const EditProfile = lazy(() => import('../container/editProfile'))
const SuccessfulTransaction = lazy(() => import('../container/successfulTransaction'))
const FailedTransaction = lazy(() => import('../container/failedTransaction'))
const WithdrawalTransaction = lazy(() => import('../container/withdrawalTransaction'))
const PaymentRequest = lazy(() => import('../container/paymentRequest'))
const Faq = lazy(() => import('../container/faq'))
const AddFaq = lazy(() => import('../container/faq/addFaq'))
const EditFaq = lazy(() => import('../container/faq/editFaq'))
const AddRole = lazy(() => import('../container/addRole'))
const EditRole = lazy(() => import('../container/editRole'))
const ManageRole = lazy(() => import('../container/manageRole'))
const ManageSubadmin = lazy(() => import('../container/manageSubadmin'))

class Routes extends PureComponent {
  render() {
    const { isLoggedIn } = this.props
    return (
      <Router history={browserHistory}>
        <Suspense fallback={isLoggedIn ? <MainLayout><LoadingView /></MainLayout> : <FullPageLoader />}>
          <NetworkDetector />
          <ScrollToTop />
          <Switch>
            <RouteWithLayout
              component={Home}
              exact
              layout={WithAuth(LoginLayout)}
              path='/'
            />

            <RouteWithLayout
              component={ResetPassword}
              exact
              layout={WithAuth(LoginLayout)}
              path='/reset-password/:token'
            />

            <RouteWithLayout
              component={ChangePasswordRoute}
              exact
              layout={WithAuth(MainLayout)}
              path='/change-password'
            />

            <RouteWithLayout
              component={EditProfile}
              exact
              layout={WithAuth(MainLayout)}
              path='/edit-profile'
            />

            <RouteWithLayout
              component={Dashboard}
              exact
              layout={WithAuth(MainLayout)}
              path='/dashboard'
            />

            <RouteWithLayout
              component={ManageUser}
              exact
              layout={WithAuth(MainLayout)}
              path='/manage-user'
            />

            <RouteWithLayout
              component={ManageMerchant}
              exact
              layout={WithAuth(MainLayout)}
              path='/manage-merchant'
            />

            <RouteWithLayout
              component={PendingRequest}
              exact
              layout={WithAuth(MainLayout)}
              path='/pending-request'
            />

            <RouteWithLayout
              component={ClosedRequest}
              exact
              layout={WithAuth(MainLayout)}
              path='/closed-request'
            />

            <RouteWithLayout
              component={Notification}
              exact
              layout={WithAuth(MainLayout)}
              path='/notification'
            />

            <RouteWithLayout
              component={SuccessfulTransaction}
              exact
              layout={WithAuth(MainLayout)}
              path='/successful-transaction'
            />

            <RouteWithLayout
              component={FailedTransaction}
              exact
              layout={WithAuth(MainLayout)}
              path='/failed-transaction'
            />

            <RouteWithLayout
              component={WithdrawalTransaction}
              exact
              layout={WithAuth(MainLayout)}
              path='/withdrawal-transaction'
            />

            <RouteWithLayout
              component={PaymentRequest}
              exact
              layout={WithAuth(MainLayout)}
              path='/payment-request'
            />

            <RouteWithLayout
              component={ManageCms}
              exact
              layout={WithAuth(MainLayout)}
              path='/manage-cms'
            />

            <RouteWithLayout
              component={Cms}
              layout={WithAuth(MainLayout)}
              path='/cms/:cmsPageId'
            />

            <RouteWithLayout
              component={Faq}
              exact
              layout={WithAuth(MainLayout)}
              path='/faq'
            />

            <RouteWithLayout
              component={AddFaq}
              exact
              layout={WithAuth(MainLayout)}
              path='/add-faq'
            />

            <RouteWithLayout
              component={EditFaq}
              exact
              layout={WithAuth(MainLayout)}
              path='/edit-faq/:faqId'
            />

            <RouteWithLayout
              component={Settings}
              exact
              layout={WithAuth(MainLayout)}
              path='/settings'
            />
            <RouteWithLayout
              component={ActivityLog}
              exact
              layout={WithAuth(MainLayout)}
              path='/activity-log'
            />
            <RouteWithLayout
              component={UserDetail}
              exact
              layout={WithAuth(MainLayout)}
              path='/user-detail/:userId'
            />
            <RouteWithLayout
              component={ManageRole}
              exact
              layout={WithAuth(MainLayout)}
              path='/manage-role'
            />
            <RouteWithLayout
              component={AddRole}
              exact
              layout={WithAuth(MainLayout)}
              path='/add-role'
            />
            <RouteWithLayout
              component={EditRole}
              exact
              layout={WithAuth(MainLayout)}
              path='/edit-role/:roleId'
            />
            <RouteWithLayout
              component={ManageSubadmin}
              exact
              layout={WithAuth(MainLayout)}
              path='/manage-user-role'
            />

            <RouteWithLayout
              component={NotFound}
              layout={MainLayout}
              path='*'
            />
          </Switch>
        </Suspense>
      </Router>
    )
  }
}


const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.auth.isLoggedIn
  }
}

const mapDispatchToProps = (dispatch) => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(Routes)