import React, { useState, useEffect } from 'react'
import { Select, Spin, Switch } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { addLinkInString, currentTimeStamp, titleCase } from '../../utilities/common'
import { getUserPermission } from '../../redux/auth/authSlice'
import { Link } from 'react-router-dom'
export function PhoneNumberComponent({ phoneNumberCountryCode, phoneNumber }) {
  if (phoneNumberCountryCode && phoneNumber) {
    return (
      <>{`${phoneNumberCountryCode}-${phoneNumber}`}</>
    )
  } else {
    return '-'
  }

}

PhoneNumberComponent.propTypes = {
  phoneNumberCountryCode: PropTypes.string.isRequired,
  phoneNumber: PropTypes.string.isRequired
}

export function EmailComponent({ emailId }) {
  if (emailId) {
    return <>{`${emailId}`}</>
  } else {
    return <span className='text-uppercase'>-</span>
  }
}

EmailComponent.propTypes = {
  emailId: PropTypes.any
}

export function ActivityTypeComponent({ cell }) {
  if (cell) {
    let res = cell.replace(/[\W_]/g, " ");
    return res.charAt(0).toUpperCase() + res.slice(1);
  } else {
    return '-'
  }
}
ActivityTypeComponent.propTypes = {
  cell: PropTypes.any
}

export function MessageComponent({ cell, data }) {
  if (cell) {
    if (data.User) {
      let userName = `${titleCase(data.User.firstName)} ${titleCase(data.User.lastName)}`
      return cell.replace('{userName}', userName.charAt(0).toUpperCase() + userName.slice(1));
    }
    return cell
  } else {
    return '-'
  }
}

MessageComponent.propTypes = {
  cell: PropTypes.any
}

export function SimpleComponent({ cell }) {
  if (cell) {
    return <>{`${cell}`}</>
  } else {
    return <span className='text-uppercase'>-</span>
  }
}

EmailComponent.propTypes = {
  cell: PropTypes.any
}

export function ImageComponent({ src, imgprops }) {
  return (
    <a data-fancybox={`gallry_${currentTimeStamp()}_${src}`} href={src}>
      <img src={src} className="rounded-circle" {...imgprops} alt={src} />
    </a>
  )
}

ImageComponent.propTypes = {
  src: PropTypes.string.isRequired,
  imgprops: PropTypes.object
}

export function VideoComponent({ src, videoprops, imgSrc }) {
  return (
    <a
      className='fancybox videoThumb'
      data-fancybox={`gallry_${currentTimeStamp()}_${src}`}
      href={src}
    >
      <img src={imgSrc} {...videoprops} alt={src} />
      <span className='icon-video-button play_icon'></span>
    </a>
  )
}

VideoComponent.propTypes = {
  src: PropTypes.string.isRequired,
  imgSrc: PropTypes.string.isRequired,
  videoprops: PropTypes.object
}

export function AudioComponent({ src }) {
  return (
    <audio controls>
      <source src={src} />
    </audio>
  )
}

AudioComponent.propTypes = {
  src: PropTypes.string.isRequired
}

export function GetNotificationMessage({ cell, row }) {
  if (row) {
    const splittedArr = addLinkInString(row.message, '{name}')
    if (splittedArr[1]) {
      splittedArr[1] = splittedArr[1].replace('{email}', row.User.email)
    }

    return (
      <>
        {
          (row.type === 'NEW_USER' && row.User.userType === 'user') && <>
            {
              splittedArr[0]
            }
            <Link to={{ pathname: "/manage-user" }}>{titleCase(row.User.firstName)} {titleCase(row.User.lastName)}</Link>
            {
              splittedArr[1]
            }
          </>
        }
        {
          (row.type === 'NEW_MERCHANT' && row.User.userType === 'merchant') && <>
            {
              splittedArr[0]
            }
            <Link to={{ pathname: "/manage-merchant" }}>{titleCase(row.User.firstName)} {titleCase(row.User.lastName)}</Link>
            {
              splittedArr[1]
            }
          </>
        }
        {
          (row.type === 'KYC_UPLOADED') && <>
            {
              splittedArr[0]
            }
            <Link to={{ pathname: `/user-detail/${row.User.id}` }}>{titleCase(row.User.firstName)} {titleCase(row.User.lastName)}</Link>
            {
              splittedArr[1]
            }
          </>
        }
        {
          (row.type === 'WITHDRAWAL_REQUEST') && <>
            {
              splittedArr[0]
            }
            <Link to={{ pathname: `/withdrawal-transaction` }}>{titleCase(row.User.firstName)} {titleCase(row.User.lastName)}</Link>
            {
              splittedArr[1]
            }
          </>
        }


      </>
    )
  } else {
    return <>-</>
  }
}
export function UserListNameComponent({ cell, data }) {
  if (
    data &&
    data.firstName &&
    data.lastName
  ) {
    return (
      <div className="info">
        {
          data.profilePictureUrl && <div className="userImg">
            <img src={data.profilePictureUrl} className="rounded-circle" alt="user img" />
          </div>
        }
        <div className="details">
          <span className="font-sm text-capitalize userName">{`${data.firstName} ${data.lastName}`}</span>
          <span>{`${data.email}`}</span>
        </div>
      </div>
    )
  } else {
    return <>-</>
  }
}


UserListNameComponent.propTypes = {
  data: PropTypes.object,
  cell: PropTypes.any
}


export function StatusBadgeComponent({ status }) {
  if (!['active', 'inactive'].includes(status)) {
    return <span
      className={'badge badge-pill align-middle ml-2'}
    >
      {status}
    </span>
  }
  status = status === 'active'
  return (
    <span
      className={`badge badge-pill ${status ? 'badge-success' : 'badge-danger'
        } align-middle ml-2`}
    >
      {status ? 'Active' : 'Inactive'}
    </span>
  )
}

StatusBadgeComponent.propTypes = {
  status: PropTypes.string.isRequired
}

export function UsernameComponent({ username }) {
  return (
    <>
      <img alt='mail-icon' src='/assets/images/user-icon.png' />{' '}
      <span>{username} </span>
    </>
  )
}

UsernameComponent.propTypes = {
  username: PropTypes.any.isRequired
}

export function ReadMoreTextShow({ data, type, showMoreText, t }) {
  if ([undefined, null, false].includes(data)) {
    return <></>
  }
  if (data.length < 80) {
    return (
      <>
        {data}
      </>
    )
  }

  return (
    <>
      {data.substring(0, 80)} <a
        href='/'
        className='theme-color ml-1'
        onClick={(e) => {
          e.preventDefault()
          showMoreText({ type, data })
        }}
      > {t('common.readMore')}...</a>
    </>
  )
}

ReadMoreTextShow.propTypes = {
  data: PropTypes.string,
  type: PropTypes.string.isRequired,
  showMoreText: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
}

export function DateComponent({ date }) {
  return (
    <>
      {date}
    </>
  )
}

DateComponent.propTypes = {
  date: PropTypes.string.isRequired
}

export function AmountComponent({ amount, symbol }) {
  return (
    <>
      {symbol} {amount}
    </>
  )
}

export function BankAccountComponent({ number }) {
  return (
    <>
      {`********${number}`}
    </>
  )
}

BankAccountComponent.propTypes = {
  number: PropTypes.number.isRequired
}

AmountComponent.propTypes = {
  amount: PropTypes.any.isRequired
}

export function PaymentReqStatusComponent({ status }) {
  if (!['paid', 'pending', 'declined']) {
    return (
      <>
        {status}
      </>
    )
  }

  let className = 'text-success'
  if (status === 'pending') {
    className = 'text-warning'
  } else if (status === 'declined') {
    className = 'text-danger'
  }

  return (
    <span className={`text-capitalize ${className}`}>
      {status}
    </span>
  )
}

PaymentReqStatusComponent.propTypes = {
  status: PropTypes.string.isRequired
}

export function StatusHighlightFormatterComponent({ status }) {
  if (!['success', 'failed']) {
    return (
      <>
        {status}
      </>
    )
  }

  let className = 'text-success'
  if (status === 'failed') {
    className = 'text-danger'
  }

  return (
    <span className={`text-capitalize ${className}`}>
      {status}
    </span>
  )
}

StatusHighlightFormatterComponent.propTypes = {
  status: PropTypes.string.isRequired
}

export function LoadingSpinner() {
  return <Spin
    indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
  />
}

export function GlobalLoader() {
  return <div className='listloader text-center'>
    <div className='icon-spinner3 spinner'>
    </div>
  </div>
}

export function ControlledSwitch({ cell, row, onChange, columnName }) {
  const [isChecked, setIsChecked] = useState(['active', 'true'].includes(cell))
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsChecked(['active', 'true'].includes(cell))
  }, [cell, row])

  const resHandleChange = (val) => {
    setIsLoading(false)
    setIsChecked(['active', 'true'].includes(val))
  }

  const handleChange = (val) => {
    setIsLoading(true)
    onChange(val, row, resHandleChange, columnName)
  }

  if (!['active', 'inactive', 'true', 'false'].includes(cell)) {
    return cell
  }
  return (
    <Switch
      defaultChecked={['active', 'true'].includes(cell)}
      loading={isLoading}
      checked={isChecked}
      onChange={handleChange}
    />
  )
}

ControlledSwitch.propTypes = {
  cell: PropTypes.string.isRequired,
  row: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  columnName: PropTypes.string
}

export function ControlledSelect({ cell, row, onChange, columnName, moduleKey = '' }) {
  let isEdit = useSelector(getUserPermission(moduleKey));
  const { t } = useTranslation()
  const [statusValue, setStatusValue] = useState(cell)
  const [isLoading, setIsLoading] = useState(false)
  const [isDisabled, setIsDisabled] = useState(['completed', 'cancelled', 'failed'].includes(cell))

  useEffect(() => {
    setStatusValue(cell)
    setIsDisabled(['completed', 'cancelled', 'failed'].includes(cell))
  }, [cell, row])

  const resHandleChange = (val) => {
    setIsLoading(false)
    setStatusValue(val)
    setIsDisabled(['completed', 'cancelled', 'failed'].includes(val))
  }

  const handleChange = (val) => {
    setIsLoading(true)
    onChange(val, row, resHandleChange, columnName)
  }

  if (!['pending', 'completed', 'cancelled', 'failed'].includes(cell)) {
    return cell
  }

  let className = ''
  if (statusValue === 'completed') {
    className = 'text-success'
  } else if (statusValue === 'cancelled') {
    className = 'text-warning'
  } else if (statusValue === 'failed') {
    className = 'text-danger'
  }

  return (
    <> {(isEdit) ? <Select
      disabled={isDisabled}
      defaultValue={cell}
      value={statusValue}
      onChange={handleChange}
      loading={isLoading}
      className={`${className}`}
    >
      <Select.Option value='pending' disabled>{t('common.pending')}</Select.Option>
      <Select.Option value='completed'>{t('common.completed')}</Select.Option>
      <Select.Option value='cancelled'>{t('common.rejected')}</Select.Option>
      <Select.Option value='failed' disabled>{t('common.failed')}</Select.Option>
    </Select> : titleCase(cell)
    }</>
  )
}

ControlledSelect.propTypes = {
  cell: PropTypes.string.isRequired,
  row: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  columnName: PropTypes.string
}


export function ControlledUserSelect({ cell, row, onChange, columnName, moduleKey = '' }) {
  let isEdit = useSelector(getUserPermission(moduleKey));
  const { t } = useTranslation()
  const [statusValue, setStatusValue] = useState(cell)
  const [isLoading, setIsLoading] = useState(false)
  const [isDisabled, setIsDisabled] = useState(['pending'].includes(cell))

  useEffect(() => {
    setStatusValue(cell)
    setIsDisabled(['pending'].includes(cell))
  }, [cell, row])

  const resHandleChange = (val) => {
    setIsLoading(false)
    setStatusValue(val)
    setIsDisabled(['pending'].includes(val))
  }

  const handleChange = (val) => {
    setIsLoading(true)
    onChange(val, row, resHandleChange, columnName)
  }

  if (!['pending', 'active', 'inactive'].includes(cell)) {
    return cell
  }

  let className = ''
  if (statusValue === 'active') {
    className = 'text-success'
  } else if (statusValue === 'pending') {
    className = 'text-warning'
  } else if (statusValue === 'inactive') {
    className = 'text-danger'
  }

  return (
    <> {
      (isEdit) ? <Select
        disabled={isDisabled}
        defaultValue={cell}
        value={statusValue}
        onChange={handleChange}
        loading={isLoading}
        className={`${className}`}
      >
        {/* <Select.Option value='pending' disabled>{t('common.pending')}</Select.Option> */}
        <Select.Option value='active'>{t('common.active')}</Select.Option>
        <Select.Option value='inactive'>{t('common.inactive')}</Select.Option>
      </Select> : titleCase(cell)
    }</>
  )
}

ControlledUserSelect.propTypes = {
  cell: PropTypes.string.isRequired,
  row: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  columnName: PropTypes.string
}
