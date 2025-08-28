import textMessages from './messages'
import config from '../config'

const EMAIL = [
  {
    required: true,
    whitespace: true,
    message: textMessages.enterEmail
  },
  {
    type: 'email',
    message: textMessages.enterValidEmail
  }
]

const PASSWORD = [
  {
    required: true,
    whitespace: true,
    message: textMessages.enterPassword
  }
]

const PASSWORD_LENGTH = [
  {
    min: 6,
    message: textMessages.passwordLengthMessage(6, 12)
  },
  {
    max: 12,
    message: textMessages.passwordLengthMessage(6, 12)
  }
]

const PORT_LENGTH = [
  {
    min: 3,
    message: textMessages.portLength,
  },
  {
    max: 3,
    message: textMessages.portLength
  }
]

const NUMERIC = [
  {
    // pattern: /[+-]?\d+(?:[.,]\d+)?/,
    pattern: `^-?[0-9]*$`,
    message: textMessages.numericOnly
  }
]
const POSITIVENUMERIC = [
  {
    // pattern: /[+-]?\d+(?:[.,]\d+)?/,
    pattern: `^[0-9]{0,7}$`,
    message: textMessages.numericOnly
  }
]
const TWILIOPHONEFORMATE = [
  {
    pattern: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
    message: textMessages.twilioPhoneNumber
  }
]

const ALPHA_NUMERIC = [
  {
    pattern: /^[a-zA-Z0-9\-\s]+$/,
    message: textMessages.alphaNumericOnly
  }
]

const CHAR_LENGTH = (min, max) => [
  {
    min: min,
    message: textMessages.enterMinChar(min)
  },
  {
    max: max,
    message: textMessages.enterMaxChar(max)
  }
]
const PHONE_NUMBER_LENGTH = (min, max) => [
  {
    min: min,
    message: textMessages.enterMinNumber(min)
  },
  {
    max: max,
    message: textMessages.enterMaxNumber(max)
  }
]


const validation = {
  profile: {
    firstName: [
      {
        required: true,
        whitespace: true,
        message: textMessages.firstName
      },
      ...CHAR_LENGTH(3, 20),
      ...ALPHA_NUMERIC
    ],
    lastName: [
      {
        required: true,
        whitespace: true,
        message: textMessages.lastName
      },
      ...CHAR_LENGTH(3, 20),
      ...ALPHA_NUMERIC
    ],
    email: EMAIL,
    icon: [
      {
        required: true,
        whitespace: true,
        message: textMessages.selectIcon
      }
    ],
    phoneNumber: [
      ...NUMERIC,
      ...PHONE_NUMBER_LENGTH(4, 15),
    ]
  },
  subadmin: {
    firstName: [
      {
        required: true,
        whitespace: true,
        message: textMessages.enterSubadminFirstName
      },
      ...CHAR_LENGTH(3, 20),
      ...ALPHA_NUMERIC
    ],
    lastName: [
      {
        required: true,
        whitespace: true,
        message: textMessages.enterSubadminLastName
      },
      ...CHAR_LENGTH(3, 20),
      ...ALPHA_NUMERIC
    ],
    email: EMAIL,
    password: [
      ...PASSWORD,
      ...PASSWORD_LENGTH
    ],
    newPassword: [
      {
        required: false,
        whitespace: true,
        message: textMessages.enterPassword
      },
      ...PASSWORD_LENGTH
    ],
    roleId: [{
      required: true,
      message: textMessages.selectRole
    }]
  },

  role: {
    name: [
      {
        required: true,
        whitespace: true,
        message: textMessages.enterRole
      },
      ...CHAR_LENGTH(3, 20),
      ...ALPHA_NUMERIC
    ]
  },
  category: {
    name: [
      {
        required: true,
        whitespace: true,
        message: textMessages.enterCategoryName
      },
      ...CHAR_LENGTH(3, 20),
      ...ALPHA_NUMERIC
    ]
  },
  collection: {
    name: [
      {
        required: true,
        whitespace: true,
        message: textMessages.enterCollectionName
      },
      ...CHAR_LENGTH(3, 50),
      ...ALPHA_NUMERIC
    ],
    currentOrder: (max) => [
      {
        required: true,
        message: textMessages.enterCollectionCurrentOrder
      },
      ({ getFieldValue }) => ({
        validator(rule, value) {
          // ORDER_RANGE(getFieldValue, value, max)
          if (Number(value) <= Number(max)) {
            return Promise.resolve()
          }
          return Promise.reject(
            textMessages.orderLengthMessage(1, max)
          )
        }
      })
    ],
    newOrder: (max) => [
      {
        required: true,
        message: textMessages.enterCollectionNewOrder
      },
      ({ getFieldValue }) => ({
        validator(rule, value) {
          // ORDER_RANGE(getFieldValue, value, max)
          if (Number(value) <= Number(max) && Number(value) > 0) {
            return Promise.resolve()
          }
          return Promise.reject(
            textMessages.orderLengthMessage(1, max)
          )
        }
      })
    ],
    collectionId: [
      {
        required: true,
        message: textMessages.selectCollection
      }
    ]
  },
  artist: {
    name: [
      {
        required: true,
        whitespace: true,
        message: textMessages.enterArtistName
      },
      ...CHAR_LENGTH(3, 25),
      ...ALPHA_NUMERIC
    ],
    icon: [
      {
        required: true,
        whitespace: true,
        message: textMessages.selectArtistIcon
      }
    ]
  },
  album: {
    name: [
      {
        required: true,
        whitespace: true,
        message: textMessages.enterAlbumName
      },
      ...CHAR_LENGTH(3, 25),
      ...ALPHA_NUMERIC
    ],
    icon: [
      {
        required: true,
        whitespace: true,
        message: textMessages.selectAlbumIcon
      }
    ],
    categoryId: [
      {
        required: true,
        message: textMessages.selectAlbumCategory
      }
    ]
  },
  track: {
    title: [
      {
        required: true,
        whitespace: true,
        message: textMessages.enterTrackName
      },
      ...CHAR_LENGTH(3, 35),
      ...ALPHA_NUMERIC
    ],
    length: [
      {
        required: true,
        message: textMessages.enterTrackLength
      }
    ],
    mediaFile: [
      {
        required: true,
        whitespace: true,
        message: textMessages.selectTrackIcon
      }
    ],
    artistId: [
      {
        required: true,
        message: textMessages.selectTrackArtist
      }
    ]
  },
  tag: {
    title: [
      {
        required: true,
        whitespace: true,
        message: textMessages.enterTagName
      },
      ...CHAR_LENGTH(3, 20),
      {
        pattern: /^[^\\#|\s]*$/,
        message: textMessages.validTagMessage
      }
    ]
  },
  interval: {
    interval: [
      {
        required: true,
        message: textMessages.enterIntervalTime
      },
      {
        pattern: /^[1-9]\d*$/,
        message: textMessages.timeIntervalError
      },
      ({ getFieldValue }) => ({
        validator(rule, value) {
          if (
            value % config.VIDEO_UPLOAD_LENGTH_MINIMUM === 0
          ) {
            return Promise.resolve()
          }
          const errShow = textMessages.timeIntervalMustInError
          return Promise.reject(errShow)
        }
      }),
      ({ getFieldValue }) => ({
        validator(rule, value) {
          if (
            value <= config.VIDEO_UPLOAD_LENGTH_LIMIT
          ) {
            return Promise.resolve()
          }
          const errShow = textMessages.timeIntervalMaxError(config.VIDEO_UPLOAD_LENGTH_LIMIT)
          return Promise.reject(errShow)
        }
      })
    ]
  },
  point: {
    points: [
      {
        required: true,
        message: textMessages.enterPoint
      },
      {
        pattern: /^[0-9]*$/,
        message: textMessages.pointValueMessage
      }
    ]
  },
  replyMessage: {
    response: [
      {
        required: true,
        whitespace: true,
        message: textMessages.enterResponse
      },
      ...CHAR_LENGTH(3, 1000)
    ]
  },
  notification: {
    message: [
      {
        required: true,
        whitespace: true,
        message: textMessages.enterNotificationMessage
      },
      ...CHAR_LENGTH(3, 1000)
    ]
  },
  cms: {
    title: [
      {
        required: true,
        whitespace: true,
        message: textMessages.enterCMSTitle
      },
      ...CHAR_LENGTH(3, 25)
    ],
    content: [
      {
        required: true,
        whitespace: true,
        message: textMessages.enterCMSContent
      }
    ]
  },
  faq: {
    question: [
      {
        required: true,
        whitespace: true,
        message: textMessages.enterFAQquestion
      },
      ...CHAR_LENGTH(3, 200)
    ],
    answer: [
      {
        required: true,
        whitespace: true,
        message: textMessages.enterFAQanswer
      },
      ...CHAR_LENGTH(3, 1000)
    ]
  },
  changePassword: {
    currentPassword: [
      {
        required: true,
        whitespace: true,
        message: textMessages.enterCurrentPassword
      }
    ],
    newPassword: [
      {
        required: true,
        whitespace: true,
        message: textMessages.enterNewPassword
      },
      ...PASSWORD_LENGTH
    ],
    confirmNewPassword: [
      {
        required: true,
        whitespace: true,
        message: textMessages.reEnterNewPassword
      },
      ({ getFieldValue }) => ({
        validator(rule, value) {
          if (!value || getFieldValue('newPassword') === value) {
            return Promise.resolve()
          }
          return Promise.reject(
            textMessages.passwordNotMatchMessage
          )
        }
      })
    ]
  },
  login: {
    email: EMAIL,
    password: PASSWORD
  },
  forgotPassword: {
    email: EMAIL
  },
  resetPassword: {
    password: [...PASSWORD, ...PASSWORD_LENGTH],
    confirm: [
      {
        required: true,
        whitespace: true,
        message: textMessages.reEnterPassword
      },
      ({ getFieldValue }) => ({
        validator(rule, value) {
          if (
            !value || getFieldValue('password') === value
          ) {
            return Promise.resolve()
          }

          return Promise.reject(
            textMessages.passwordNotMatchMessage
          )
        }
      })
    ]
  },
  kycMessage: {
    status: [
      {
        required: true,
        message: textMessages.selectKycStatus
      }
    ],
    reason: [
      {
        required: true,
        whitespace: true,
        message: textMessages.enterReason
      },
      ...CHAR_LENGTH(0, 500)
    ]
  },
  settings: {
    twilioAccountSid: [
      {
        required: true,
        whitespace: true,
        message: textMessages.twilioAccountSid
      }
    ],
    twilioAuthToken: [
      {
        required: true,
        whitespace: true,
        message: textMessages.twilioAuthToken
      }
    ],
    twilioFromNumber: [
      {
        required: true,
        whitespace: true,
        message: textMessages.twilioFromNumber
      },
      ...TWILIOPHONEFORMATE
    ],
    smtpEmailFromName: [
      {
        required: true,
        whitespace: true,
        message: textMessages.smtpEmailFromName
      }
    ],
    smtpEmailFromEmail: EMAIL,
    smtpHostd: [
      {
        required: true,
        whitespace: true,
        message: textMessages.smtpHostd
      }
    ],
    smtpPort: [
      {
        required: true,
        whitespace: true,
        message: textMessages.smtpPort
      },
      ...PORT_LENGTH,
      ...NUMERIC
    ],
    smtpUsername: [
      {
        required: true,
        whitespace: true,
        message: textMessages.smtpUsername
      }
    ],
    smtpPassword: [
      ...PASSWORD
    ],
    nonKycUserTransactionLimit: [
      {
        required: true,
        whitespace: true,
        message: textMessages.nonKycUserTransactionLimit
      },
      ...POSITIVENUMERIC
    ],
    kycUserTransactionLimit: [
      {
        required: true,
        whitespace: true,
        message: textMessages.kycUserTransactionLimit
      },
      ...POSITIVENUMERIC
    ],
    transactionLimitDays: [
      {
        required: true,
        whitespace: true,
        message: textMessages.transactionLimitDays
      },
      ...POSITIVENUMERIC
    ],
    currency_abbr: [
      {
        required: true,
        message: textMessages.currencyAbbr
      },
    ],
    country_phone_code: [
      {
        required: true,
        message: textMessages.countryPhoneCode
      },
    ]
  },
}

const inputParser = {
  number: (value) => {
    value = value.replace(/[^0-9]/g, '')
    const regexNum = /^[0-9]*$/
    if (regexNum.test(value)) {
      return value
    }
  }
}

export default validation
export { inputParser }

