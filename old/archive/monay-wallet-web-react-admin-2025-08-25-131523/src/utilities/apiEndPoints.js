// import socketIOClient from 'socket.io-client'
import config from '../config'

const ApiEndPoints = {
  /**
   * Account
   */
  accountLogin: {
    url: '/admin/login',
    method: 'POST'
  },
  accountUpdate: {
    url: '/admin/account/update-profile',
    method: 'PUT'
  },
  accountChangePassword: {
    url: '/account/change-password',
    method: 'POST'
  },
  accountForgotPassword: {
    url: '/admin/forgot-password',
    method: 'POST'
  },
  accountResetPassword: {
    url: '/admin/reset-password',
    method: 'POST'
  },
  accountLogout: {
    url: '/account/logout',
    method: 'POST'
  },
  /**
   * Dashboard
   */
  dashboard: {
    url: '/admin/dashboard',
    method: 'GET'
  },
  dashboardDonutGraph: {
    url: '/admin/dashboard/donut/graph',
    method: 'GET'
  },
  dashboardLineGraph: {
    url: '/admin/dashboard/line/graph',
    method: 'GET'
  },
  /**
   * CMS
   */
  getCms: {
    url: '/admin/cms',
    method: 'GET'
  },
  getSpecificCms: (id) => ({
    url: `/admin/cms/${id}`,
    method: 'GET'
  }),
  updateSpecificCms: (id) => ({
    url: `/admin/cms/${id}`,
    method: 'PUT'
  }),
  /**
   * FAQ
   */
  addFaq: {
    url: '/admin/faq',
    method: 'POST'
  },
  getFaq: {
    url: '/admin/faq',
    method: 'GET'
  },
  getSpecificFaq: (id) => ({
    url: `/admin/faq/${id}`,
    method: 'GET'
  }),
  updateSpecificFaq: (id) => ({
    url: `/admin/faq/${id}`,
    method: 'PUT'
  }),
  deleteSpecificFaq: (id) => ({
    url: `/admin/faq/${id}`,
    method: 'DELETE'
  }),
  /**
   * User
   */
  getUser: {
    url: '/admin/user',
    method: 'GET'
  },
  getSpecificUser: (id) => ({
    url: `/admin/user/${id}`,
    method: 'GET'
  }),
  updateStatusUser: (id) => ({
    url: `/admin/user/${id}/change-status`,
    method: 'PUT'
  }),
  updateKycStatusUser: (id) => ({
    url: `/admin/user/${id}/kyc-status`,
    method: 'PUT'
  }),
  updateUserTag: {
    url: '/admin/update/user-tag',
    method: 'PUT'
  },
  getKycDocuments: (userId) => ({
    url: `/admin/user-profile/${userId}`,
    method: 'GET'
  }),
  getUserDetails: (userId) => ({
    url: `/admin/user-profile/${userId}`,
    method: 'GET'
  }),
  /**
  * Activity log
  */
  getActivityLog: {
    url: '/admin/activity/log',
    method: 'GET'
  },
  /**
  * Subadmin
  */
  addSubadmin: {
    url: '/admin/subadmin',
    method: 'POST'
  },
  editSubadmin: {
    url: '/admin/subadmin',
    method: 'PUT'
  },
  getSubadmin: {
    url: '/admin/subadmin',
    method: 'GET'
  },

  /**
   * Role
   */
  addRole: {
    url: '/admin/role/permission',
    method: 'POST'
  },
  getRole: {
    url: '/admin/role/permission',
    method: 'GET'
  },
  getSpecificRole: (id) => ({
    url: `/admin/role/permission/${id}`,
    method: 'GET'
  }),
  /**
   * Transaction
   */
  getTransaction: {
    url: '/admin/transaction',
    method: 'GET'
  },
  updateWithdrawalStatus: (id) => ({
    url: `/admin/withdrawal/${id}/change-status`,
    method: 'PUT'
  }),
  /**
   * Payment Request
   */
  getPaymentRequest: {
    url: '/admin/payment/request',
    method: 'GET'
  },
  /**
   * Request
   */
  getRequest: {
    url: '/admin/support/request',
    method: 'GET'
  },
  updateRequest: (id) => ({
    url: `/admin/support/request/${id}`,
    method: 'PUT'
  }),
  /**
   * Settings
   */
  getSettingsData: {
    url: '/admin/setting',
    method: 'GET'
  },
  updateSettings: {
    url: '/admin/setting',
    method: 'PUT'
  },
  updateCountrySettings: {
    url: '/admin/country/setting',
    method: 'PUT'
  },
  getCountryList: {
    url: '/admin/country',
    method: 'GET'
  },
  /**
   * Notification
   */
  getNotification: {
    url: '/admin/notification',
    method: 'GET'
  },
  postNotification: {
    url: '/admin/topic/notification',
    method: 'POST'
  },
  putNotification: {
    url: '/notification/status',
    method: 'PUT'
  },
  /**
   * Media URL
   */
  media: {
    userImage: `${config.API_BASE_URL}/media/upload/user/image`,
  },
  socket: {
    // client: socketIOClient(config.SOCKET_URL)
  }
}

export default ApiEndPoints
