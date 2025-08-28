import React from 'react'
import moment from 'moment'
import CryptoJS from 'crypto-js'
import querystring from 'querystring'
import {
  PhoneNumberComponent,
  ImageComponent,
  EmailComponent,
  AudioComponent,
  VideoComponent,
  DateComponent,
  ReadMoreTextShow,
  ControlledSelect,
  ControlledUserSelect,
  UserListNameComponent,
  AmountComponent,
  BankAccountComponent,
  PaymentReqStatusComponent,
  SimpleComponent,
  ControlledSwitch,
  StatusHighlightFormatterComponent,
  ActivityTypeComponent,
  MessageComponent,
  GetNotificationMessage
} from '../components/common'
import config from '../config'
import logger from './logger'

export const setSessionStorageToken = (token) => {
  sessionStorage.setItem(`${config.NAME_KEY}:token`, CryptoJS.AES.encrypt(token, `${config.NAME_KEY}-token`).toString())
}

export const getSessionStorageToken = () => {
  const ciphertext = sessionStorage.getItem(`${config.NAME_KEY}:token`)
  if (ciphertext) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, `${config.NAME_KEY}-token`)
    return bytes.toString(CryptoJS.enc.Utf8)
  }
  return false
}
export const removeSessionStorageToken = () => {
  if (sessionStorage.getItem(`${config.NAME_KEY}:token`)) {
    sessionStorage.setItem(`${config.NAME_KEY}:token`, null);
    window.location.href = '/'
  }
}

export const getLocalStorageLanguage = () => {
  const language = localStorage.getItem(`${config.NAME_KEY}:language`)
  if (language) {
    return ['en', 'hi'].includes(language) ? language : config.DEFAULT_LANGUAGE
  }
  return config.DEFAULT_LANGUAGE
}

export const checkUserPermission = (userData, moduleKey) => {
  let isEdit = false;
  isEdit = (userData.userType === 'admin') ? true : false;
  if (userData.permissions) {
    let moduleKeyObj = userData.permissions.find(item => {
      return item.moduleKey === moduleKey
    });
    if (moduleKeyObj && moduleKeyObj.permission === 'edit') {
      isEdit = true;
    }
  }
  return isEdit;
}

/**
 * Formatter for Data Tables
 */
export const phoneNumberFormatter = (cell, row) => {
  return (
    <PhoneNumberComponent
      phoneNumberCountryCode={row.phoneNumberCountryCode}
      phoneNumber={row.phoneNumber}
    />
  )
}
export const csvPhoneNumberFormatter = (cell, row) => {
  let phone = '';
  if (row.phoneNumberCountryCode && row.phoneNumber) {
    phone = `"${row.phoneNumberCountryCode}"& -${row.phoneNumber}`
  }
  return phone;

}

export const emailFormatter = (cell, row) => {
  return <EmailComponent emailId={cell} />
}

export const simpleFormatter = (cell, row) => {
  return <SimpleComponent cell={cell} />
}

export const imageFormatter = (cell, row) => {
  return (
    <div className="userImg">
      <ImageComponent src={cell} />
    </div>
  )
}

export const videoFormatter = (cell, row) => {
  return (
    <div className="user_img">
      <VideoComponent src={cell} imgSrc={row.mediaFileThumbUrl} />
    </div>
  )
}

export const audioFormatter = (cell, row) => {
  return <AudioComponent src={cell} />
}

export const userListName = (cell, row) => {
  return <UserListNameComponent cell={cell || {}} data={row} />
}


export const getNotificationMessage = (cell, row) => {
  return <GetNotificationMessage cell={cell || {}} row={row} />
}

export const activityTypeFormatter = (cell, row) => {
  return <ActivityTypeComponent cell={cell || {}} data={row} />
}

export const messageFormatter = (cell, row) => {
  return <MessageComponent cell={cell || {}} data={row} />
}

export const activityTypeCSVFormatter = (cell, row) => {
  if (cell) {
    let res = cell.replace(/[\W_]/g, " ");
    return res.charAt(0).toUpperCase() + res.slice(1);
  } else {
    return '-'
  }
}
export function messageCSVFormatter(cell, row) {
  if (cell) {
    if (row.User) {
      let userName = `${titleCase(row.User.firstName)} ${titleCase(row.User.lastName)}`
      return cell.replace('{userName}', userName.charAt(0).toUpperCase() + userName.slice(1));
    }
    return cell
  } else {
    return '-'
  }
}

export const userListNameCSV = (cell, row) => {
  if (row && row.firstName && row.lastName) {
    return `${row.firstName} ${row.lastName}`
  } else {
    return ''
  }
}

export const csvSimpleFormatter = (cell) => {
  if (cell) {
    return cell
  } else {
    return '-'
  }
}

export const statusFormatter = (cell, row, onChange, columnName) => {
  return ['active', 'inactive', 'true', 'false', true, false].includes(cell) ? <ControlledSwitch
    cell={cell}
    row={row}
    onChange={onChange}
    columnName={columnName}
  /> : <span className="text-capitalize">{cell}</span>
}

export const statusKycFormatter = (cell, row, onChange, columnName) => {

  return (
    <ul className="list-status list-inline">
      <li className="list-inline-items"><i className={(row.isEmailVerified) ? 'icon text-success icon-check' : 'icon text-danger icon-failed-trans'}></i> <span>Email</span></li>

      <li className="list-inline-items"><i className={(row.kycStatus === 'pending' || row.kycStatus === 'rejected') ? 'icon text-danger icon-failed-trans' : (row.kycStatus === 'approved') ? 'icon text-success icon-check' : 'icon text-warning icon-access_time'}></i> <span>KYC</span></li>
    </ul>
  )

}

export const csvStatusKycFormatter = (cell, row, onChange, columnName) => {

  let emailStatus = (row.isEmailVerified) ? 'verified' : 'pending';
  return `email status= ${emailStatus} kyc status=  ${row.kycStatus}`


}

export const withdrawalStatusFormatter = (cell, row, onChange, columnName, moduleKey) => {
  return ['pending', 'completed', 'cancelled', 'failed'].includes(cell) ? <ControlledSelect
    cell={cell}
    row={row}
    onChange={onChange}
    columnName={columnName}
    moduleKey={moduleKey}
  /> : <span className="text-capitalize">{cell}</span>
}

export const CsvWithdrawalStatusFormatter = (cell, row) => {
  let status = cell;
  if (cell === 'cancelled') {
    status = 'rejected'
  }
  return status
}

export const userStatusFormatter = (cell, row, onChange, columnName, moduleKey = '') => {
  return ['pending', 'active', 'inactive'].includes(cell) ? <ControlledUserSelect
    cell={cell}
    row={row}
    onChange={onChange}
    columnName={columnName}
    moduleKey={moduleKey}
  /> : <span className="text-capitalize">{cell}</span>
}

export const dateFormatter = (cell, row) => {
  return <DateComponent date={showDateInBrowser(cell)} />
}
export const csvDateFormatter = (cell, row) => {
  let date = '';
  if (cell) {
    date = moment(cell).format('DD/MM/YYYY hh:mm A')
  }

  return date;
}

export const csvAmountFormatter = (cell, row, symbol) => {


  return `${symbol} ${cell}`
}

export const amountFormatter = (cell, row, symbol) => {
  return <AmountComponent amount={cell} symbol={symbol} />
}



export const bankAccountFormatter = (cell, row) => {
  return <BankAccountComponent number={cell} />
}
export const CsvBankAccountFormatter = (cell, row) => {
  return `********${cell}`
}

export const paymentReqStatus = (cell, row) => {
  return <PaymentReqStatusComponent status={cell || ''} />
}

export const statusHighlightFormatter = (cell, row) => {
  return <StatusHighlightFormatterComponent status={cell || ''} />
}

export const readMoreText = (cell, row, type, showMoreText, t) => {
  return (
    <ReadMoreTextShow data={cell} type={type} showMoreText={showMoreText} t={t} />
  )
}

export const serialNumberFormatter = (rowIndex, currentPage, dataPerPage) => {
  return ((rowIndex + (dataPerPage * (currentPage - 1))) + 1) || rowIndex
}

export const capitalize = (str) => {
  return (str.charAt(0).toUpperCase() + str.slice(1));
}
/**
 * Toggle Class
 */

export const tagClassToggle = (tag, className) => {
  const element = document.getElementsByTagName(tag)[0]

  if (element.classList) {
    element.classList.toggle(className)
  } else {
    const classes = element.className.split(' ')
    const i = classes.indexOf(className)

    if (i >= 0) classes.splice(i, 1)
    else classes.push(className)
    element.className = classes.join(' ')
  }
}

/**
 * Toggle Class
 */

export const classToggle = (tag, className) => {
  const element = document.getElementsByClassName(tag)[0]

  if (element) {
    if (element.classList) {
      element.classList.toggle(className)
    } else {
      const classes = element.className.split(' ')
      const i = classes.indexOf(className)

      if (i >= 0) classes.splice(i, 1)
      else classes.push(className)
      element.className = classes.join(' ')
    }
  }
}

/**
 * Toggle Class
 */

export const classToggleOfLoginAndForgot = (from) => {
  logger({ from })
  classToggle('forgot_password', 'open')
  classToggle('login', 'disabled')
  classToggle('forgotpassword', 'forgotpassword_hover')
}

/**
 * Date Time
 */
export const dateFormatDMY = 'DD-MM-YYYY'

export const showDateInBrowser = (data) => {
  return moment(data).format('DD/MM/YYYY hh:mm A')
}

export const toSendDateInApi = (data) => {
  return moment(data).format('YYYY-MM-DD')
}

export const currentTimeStamp = () => new Date().getTime()

export const currentDate = () => {
  let current_datetime = new Date()
  let formatedDate = current_datetime.getDate() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getFullYear()
  return formatedDate;

}

/**
 * Dashboard Number Format
 */

export const numberFormatter = (num) => {
  num = Number(num)
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'G'
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  }
  return num || 0
}
/**
 * Dashboard last week percent Format
 */

export const lastWeekPercent = (previousValue, currentValue) => {
  previousValue = Number(previousValue)
  currentValue = Number(currentValue)
  let per = 0;
  if (currentValue && previousValue) {
    per = (currentValue / previousValue) * 100;
  } else if (Number(currentValue) === 0 && Number(previousValue) === 0) {
    per = 0;
  } else if (Number(currentValue) > 0 && Number(previousValue) === 0) {
    per = (currentValue / 1) * 100;
  } else if (Number(currentValue) === 0 && previousValue > 0) {
    per = (previousValue / 1) * 100;
  }

  if (previousValue <= currentValue) {
    if (previousValue > 0) {
      if (per >= 100) { per = per - 100 };
    }

    return (<>
      < span className="change up" > <i className="icon icon-arrow-up2"></i>{parseFloat(per).toFixed(2)}%</span >
      <span> vs. last week</span>
    </>
    )
  } else {
    if (currentValue > 0) {
      per = 100 - per;
    }
    return (<>
      <span className="change down"><i className="icon icon-arrow-down2"></i>{parseFloat(per).toFixed(2)}%</span>
      <span> vs. last week</span>
    </>)
  }

}

/**
 * File Size
 */

export const fileSizeLimitCheck = (fileSize, fileType) => {
  const res = {
    success: true
  }

  fileSize = fileSize / 1024 / 1024 // In MB

  if (fileType === 'image') {
    if (fileSize > config.IMAGE_UPLOAD_SIZE_LIMIT) {
      res.success = false
      res.limit = config.IMAGE_UPLOAD_SIZE_LIMIT
    }
  } else if (fileType === 'audio') {
    if (fileSize > config.AUDIO_UPLOAD_SIZE_LIMIT) {
      res.success = false
      res.limit = config.AUDIO_UPLOAD_SIZE_LIMIT
    }
  } else if (fileType === 'video') {
    if (fileSize > config.VIDEO_UPLOAD_SIZE_LIMIT) {
      res.success = false
      res.limit = config.VIDEO_UPLOAD_SIZE_LIMIT
    }
  } else {
    res.success = false
    res.limit = 100
  }

  return res
}

/**
 * Audio File Length
 */

export const checkAudioFileLength = (length) => {
  const res = {
    success: true
  }

  if (length > config.AUDIO_UPLOAD_LENGTH_LIMIT || length < config.AUDIO_UPLOAD_LENGTH_MINIMUM) {
    res.success = false
    res.limit = {
      minLength: config.AUDIO_UPLOAD_LENGTH_MINIMUM,
      maxLength: config.AUDIO_UPLOAD_LENGTH_LIMIT
    }
  }

  return res
}

export const getBase64OfsvgURL = (srcURL) => {

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = srcURL
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.height = img.naturalHeight
      canvas.width = img.naturalWidth
      ctx.drawImage(img, 0, 0)
      const dataURL = canvas.toDataURL()
      resolve(dataURL)
    }
    img.onerror = error => reject(error)
  })
}

/**
 * Get query for the datatable
 * page
 * perpage
 */
export const getPageSizeFromURL = (query, location, allowOtherQuery = false) => {
  if (query.charAt(0) === '?') { // eslint-disable-line
    query = query.substring(1) // eslint-disable-line
  }
  query = querystring.parse(query)

  if (
    Object.keys(query).length > 0 &&
    (
      (
        Object.keys(query).includes('page') &&
        Object.keys(query).includes('perpage')
      ) || (
        Object.keys(query).includes('tab')
      )
    )
  ) {
    const page = location.search ? Number(query.page || 1) : 1 // eslint-disable-line
    const sizePerPage = Number(query.perpage || 10) // eslint-disable-line
    const queryParams = {
      offset: Number(((page - 1) * sizePerPage)), // eslint-disable-line
      limit: Number(sizePerPage) // eslint-disable-line
    }


    return { queryParams, data: { ...query, page, sizePerPage }, ...query }
  }

  if (allowOtherQuery) {
    return { ...query, data: {} }
  }

  return false
}

/**
 * Get query for the datatable
 * page
 * perpage
 */
export const addPageSizeInURL = (page, sizePerPage, history, addQueryPayload = {}) => {
  if (page > 0) {
    history.push({
      search: querystring.stringify({
        page: page,
        perpage: sizePerPage,
        ...addQueryPayload
      })
    })
  }
}

export const updateQueryInURL = (history, query = {}) => {
  history.push({
    search: querystring.stringify(query)
  })
}


/**
 * Title Case
 */
export const titleCase = (str) => {
  if (str) {
    return str.toLowerCase().split(' ').map((word) => {
      if (word) {
        return word.replace(word[0], word[0].toUpperCase())
      }
      return word
    }).join(' ')
  }
  return str
}

/**
 * Filter data
 */
export const filterDataObj = (values) => {
  const filterData = {}
  for (const key in values) {
    if (Object.hasOwnProperty.call(values, key)) {
      if (values[key] && (key === 'createdAt')) {
        for (let index = 0; index < values[key].length; index++) {
          const element = values[key][index]
          if (index === 0) {
            filterData.fromDate = toSendDateInApi(element)
          }
          if (index === 1) {
            filterData.toDate = toSendDateInApi(element)
          }
        }
      } else {
        if (values[key]) {
          if (values[key]) {
            filterData[key] = values[key]
          }
        }
      }
    }
  }
  const filterCount = filterDataCount(filterData)
  return {
    filterData,
    filterCount
  }
}

/**
 * Filter Count Management
 */
export const filterDataCount = (filterObj) => {
  let count = Object.keys(filterObj).length || 0
  if (
    count > 0 &&
    Object.keys(filterObj).includes('fromDate') &&
    Object.keys(filterObj).includes('toDate')
  ) {
    count -= 1
  }

  return count
}

/**
 * Common
 */

export const acceptImageFiles = '.png, .jpg, .jpeg'

/**
 * add link in the 
 */
export const addLinkInString = (str, keyword) => {
  return str.split(keyword);
}