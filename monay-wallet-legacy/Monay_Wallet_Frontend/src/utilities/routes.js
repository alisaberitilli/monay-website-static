export const routesJSON = (t = (arg) => arg, permissions = []) => [
  {
    endPoint: '/dashboard',
    authRequire: true,
    addInSideBar: true,
    active: [
      '/dashboard'
    ],
    title: t('dashboard.title'),
    icon: 'icon-savour-menu',
    userTypes: checkPermission(permissions, 'dashboard'),
    moduleKey: 'dashboard'
  },
  {
    endPoint: '/manage-user',
    authRequire: true,
    addInSideBar: true,
    active: [
      '/manage-user'
    ],
    title: t('user.title'),
    icon: 'icon-user',
    userTypes: checkPermission(permissions, 'user'),
    moduleKey: 'user'
  },
  {
    endPoint: '/manage-merchant',
    authRequire: true,
    addInSideBar: true,
    active: [
      '/manage-merchant'
    ],
    title: t('merchant.title'),
    icon: 'icon-main-merchants',
    userTypes: checkPermission(permissions, 'merchant'),
    moduleKey: 'merchant'
  },

  {
    endPoint: '/payment-request',
    authRequire: true,
    addInSideBar: true,
    active: [
      '/payment-request'
    ],
    title: t('transaction.paymentRequest'),
    icon: 'icon-main-payment-request icon',
    userTypes: checkPermission(permissions, 'payment_request'),
    moduleKey: 'payment_request'
  },
  {
    endPoint: '/withdrawal-transaction',
    authRequire: true,
    addInSideBar: true,
    active: [
      '/withdrawal-transaction'
    ],
    title: t('transaction.withdrawalTransaction'),
    icon: 'icon-main-withdraw-request icon',
    userTypes: checkPermission(permissions, 'withdrawal_request'),
    moduleKey: 'withdrawal_request'
  },
  {
    endPoint: 'transaction',
    authRequire: true,
    addInSideBar: true,
    active: [
      '/successful-transaction',
      '/failed-transaction',
      // '/withdrawal-transaction',
      // '/payment-request'
    ],
    title: t('transaction.title'),
    icon: 'icon-main-transactions icon',
    userTypes: checkPermission(permissions, 'transaction'),
    moduleKey: 'transaction',
    child: [
      {
        endPoint: '/successful-transaction',
        authRequire: true,
        addInSideBar: true,
        active: [
          '/successful-transaction'
        ],
        title: t('transaction.successfulTransaction'),
        icon: 'icon-transactions icon',
        userTypes: checkPermission(permissions, 'transaction'),
        moduleKey: 'transaction',
      },
      {
        endPoint: '/failed-transaction',
        authRequire: true,
        addInSideBar: true,
        active: [
          '/failed-transaction'
        ],
        title: t('transaction.failedTransaction'),
        userTypes: checkPermission(permissions, 'transaction'),
        moduleKey: 'transaction',
      }
    ]
  },

  {
    endPoint: '/manage-user-role',
    authRequire: true,
    addInSideBar: true,
    active: [
      '/manage-user-role'
    ],
    title: t('subadmin.title'),
    icon: 'icon-sub-admin',
    userTypes: ['admin'],
    moduleKey: ''
  },
  {
    endPoint: '/manage-role',
    authRequire: true,
    addInSideBar: true,
    active: [
      '/manage-role',
      '/add-role',
    ],
    title: t('role.roleTitle'),
    icon: 'icon-role',
    userTypes: checkPermission(permissions, 'role'),
    moduleKey: 'role'
  },
  {
    endPoint: '/add-role',
    authRequire: true,
    addInSideBar: false,
    active: [
      '/manage-role',
      '/add-role',
    ],
    title: '',
    icon: '',
    userTypes: ['admin'],
    moduleKey: ''
  },
  {
    endPoint: '/edit-role/:roleId',
    authRequire: true,
    addInSideBar: false,
    active: [
      '/manage-role',
      '/add-role',
      '/edit-role/:roleId'
    ],
    title: '',
    icon: '',
    userTypes: ['admin'],
    moduleKey: ''
  },
  {
    endPoint: '/activity-log',
    authRequire: true,
    addInSideBar: true,
    active: [
      '/activity-log'
    ],
    title: t('activityLog.title'),
    icon: 'icon-activity',
    userTypes: [
      'admin'
    ]
  },
  {
    endPoint: '/notification',
    authRequire: true,
    addInSideBar: false,
    active: [
      '/notification'
    ],
    title: t('notification.title'),
    icon: 'icon-savour-notification',
    userTypes: [
      'admin'
    ]
  },
  {
    endPoint: '/manage-cms',
    authRequire: true,
    addInSideBar: true,
    active: [
      '/manage-cms',
      '/cms/:cmsPageId',
      '/faq',
      '/add-faq',
      '/edit-faq/:faqId'
    ],
    title: t('cms.title'),
    icon: 'icon-main-cms',
    userTypes: checkPermission(permissions, 'cms'),
    moduleKey: 'cms'
  },
  {
    endPoint: '/cms/:cmsPageId',
    authRequire: true,
    addInSideBar: false,
    active: [
      '/cms/:cmsPageId'
    ],
    title: '',
    icon: '',
    userTypes: checkPermission(permissions, 'cms'),
    moduleKey: 'cms'
  },
  {
    endPoint: '/faq',
    authRequire: true,
    addInSideBar: false,
    active: [
      '/faq'
    ],
    title: '',
    icon: '',
    userTypes: checkPermission(permissions, 'cms'),
    moduleKey: 'cms'
  },
  {
    endPoint: '/add-faq',
    authRequire: true,
    addInSideBar: false,
    active: [
      '/add-faq'
    ],
    title: '',
    icon: '',
    userTypes: checkPermission(permissions, 'cms'),
    moduleKey: 'cms'
  },
  {
    endPoint: '/edit-faq/:faqId',
    authRequire: true,
    addInSideBar: false,
    active: [
      '/edit-faq/:faqId'
    ],
    title: '',
    icon: '',
    userTypes: checkPermission(permissions, 'cms'),
    moduleKey: 'cms'
  },
  {
    endPoint: '/change-password',
    authRequire: true,
    addInSideBar: false,
    active: [
      '/change-password'
    ],
    title: '',
    icon: '',
    userTypes: [
      'admin', 'subadmin'
    ]
  },
  {
    endPoint: '/edit-profile',
    authRequire: true,
    addInSideBar: false,
    active: [
      '/edit-profile'
    ],
    title: '',
    icon: '',
    userTypes: [
      'admin', 'subadmin'
    ]
  },
  {
    endPoint: '/reset-password/:token',
    authRequire: false,
    addInSideBar: false,
    active: [
      '/reset-password/:token'
    ],
    title: '',
    icon: '',
    userTypes: [
      'admin', 'subadmin'
    ]
  },
  {
    endPoint: '/',
    authRequire: false,
    addInSideBar: false,
    active: [
      '/'
    ],
    title: '',
    icon: '',
    userTypes: [
      'admin', 'subadmin'
    ]
  },
  {
    endPoint: '/settings',
    authRequire: true,
    addInSideBar: true,
    active: [
      '/settings'
    ],
    title: t('settings.title'),
    icon: 'icon-settings',
    userTypes: checkPermission(permissions, 'settings'),
    moduleKey: 'settings'
  },

  {
    endPoint: '/user-detail/:userId',
    authRequire: true,
    addInSideBar: false,
    active: [
      '/user-detail/:userId'
    ],
    title: '',
    icon: '',
    userTypes: checkPermission(permissions, 'user'),
    moduleKey: 'user'
  },

]

export const redirectPathIfRequireAuthFails = [
  '/',
  '/forgot-password',
  '/reset-password/:token'
]

export const redirectPathIfNotRequireAuthFails = [
  {
    path: '/dashboard',
    userTypes: ['admin']
  },
  {
    path: '/dashboard',
    userTypes: ['subadmin']
  },
]

const checkPermission = (permissions, moduleKey) => {
  if (permissions) {
    let moduleKeyIndex = permissions.findIndex(item => {
      return (moduleKey === 'send_notification') ? (item.moduleKey === moduleKey && item.permission === 'edit') : (item.moduleKey === moduleKey)
    });
    if (moduleKeyIndex > -1) {
      return ['admin', 'subadmin'];
    }
  }
  return ['admin'];
}
