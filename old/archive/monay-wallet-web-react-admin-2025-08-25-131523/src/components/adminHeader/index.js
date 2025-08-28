import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { logoutAction } from '../../redux/auth/authSlice'
import { removeSessionStorageToken, titleCase, getNotificationMessage } from '../../utilities/common'
import modalNotification from '../../utilities/notifications'
import ApiEndPoints from '../../utilities/apiEndPoints'
import APIrequest from '../../services'
import textMessages from '../../utilities/messages'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { addNotificationsAction, updateNotificationsCountAction } from '../../redux/common/commonSlice'
import logger from '../../utilities/logger'

class AdminHeader extends PureComponent {

  componentDidMount() {
    const { notification: { recentlyFetchedAt } } = this.props
    if (recentlyFetchedAt === '') {
      this.fetchNotification()
    }
    setInterval(() => {
      this.fetchNotification()
    }, 1000 * 60 * 5);
  }

  logout = async () => {
    const payload = {
      ...ApiEndPoints.accountLogout
    }
    try {
      const res = await APIrequest(payload)
      this.updateStorage(res.message)
    } catch (error) {
      this.updateStorage()
    }
  }

  updateStorage = (description = '') => {
    modalNotification({
      type: 'success',
      message: 'Logout',
      description: description || textMessages.logoutSuccessfully
    })
    this.props.logoutRedux()
    removeSessionStorageToken()
  }

  changeLanguage = lng => {
    const { i18n } = this.props
    i18n.changeLanguage(lng)
    setTimeout(() => {
      window.location.reload()
    }, 1000 / 4)
  };

  fetchNotification = async (
    queryParams = {
      offset: (0 * 10),
      limit: 10
    }
  ) => {
    try {
      const payload = {
        ...ApiEndPoints.getNotification,
        queryParams
      }
      const res = await APIrequest(payload)
      this.props.addNotificationsActionRedux({
        list: res.data.rows,
        count: res.data.unReadCount
      })
    } catch (error) {
      logger({ 'error:': error })
    }
  };

  updateUnreadCount = async () => {
    try {
      const payload = {
        ...ApiEndPoints.putNotification
      }
      await APIrequest(payload)
      this.props.updateNotificationsCountActionRedux({
        count: 0
      })
    } catch (error) {
      logger({ 'error:': error })
    }
  }

  toNotifications = () => {
    const {
      notification: { count }
    } = this.props
    if (count > 0) {
      this.updateUnreadCount()
    }
    this.props.history.push({
      pathname: '/notification'
    })
  }

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

    return cell.replace('{name}', replaceWith)
  }

  render() {
    const {
      t,
      userDetail,
      notification
    } = this.props

    return (
      <>
        <ul className='nav right_nav d-flex align-items-center'>
          {(userDetail.userType === 'admin') ?
            <li className="nav-item notification dropdown">
              <Link
                to=""
                onClick={(e) => {
                  e.preventDefault()
                }}
                className="nav-link dropdown-toggle d-flex align-items-center"
                role="button"
                id="dropdownMenuLink"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <i className="icon-savour-notification" aria-hidden="true"></i>
                <span className="count rounded-circle text-center position-absolute d-inline-block">{notification.count}</span>
              </Link>
              <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                <h2 className="heading font-sm mb-0">{t('notification.title')}</h2>
                <div className="notification-listWrap mCustomScrollbar">
                  <ul className="list-unstyled notification-list position-relative ">
                    {
                      notification.list.map((data, index) => {
                        return <li key={`${data.id}_${index}`}>{getNotificationMessage(data.message, data)}</li>
                      })
                    }
                  </ul>
                </div>
                <div className="view-all text-center">
                  <Link
                    to=""
                    className="linkPrimary"
                    onClick={(e) => {
                      e.preventDefault()
                      this.toNotifications()
                    }}
                  >{t('common.viewAll')}</Link>
                </div>
              </div>
            </li> : ''}

          <li className='nav-item dropdown user_info'>
            <a href='/' onClick={e => e.preventDefault()} className='nav-link d-flex align-items-center dropdown-toggle' id='dropdownMenuButton' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
              <div className="name">
                {`${userDetail.firstName} ${userDetail.lastName}` || 'Admin'}
              </div>
            </a>
            <div className='dropdown-menu' aria-labelledby='dropdownMenuButton'>
              <Link
                className='dropdown-item'
                to='/edit-profile'
              ><i className="icon icon-savour-customer"></i>
                {t('editProfile.title')}
              </Link>
              <Link
                className='dropdown-item'
                to='/change-password'
              ><i className="icon icon-password"></i>
                {t('header.changePassword')}</Link>
              <a
                className='dropdown-item'
                href='/'
                onClick={e => {
                  e.preventDefault()
                  this.logout()
                }}
              ><i className="icon icon-logout"></i>
                {t('header.logout')}</a>
            </div>
          </li>
          <li className="nav-item user_img d-flex align-items-center justify-content-center h-100 position-absolute">
            <Link
              className="nav-link overflow-hidden"
              to='/edit-profile'
            >
              <img src={userDetail.profilePictureUrl} className="img-fluid w-100 h-100" alt="user-img" />
            </Link>
          </li>
        </ul>
      </>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    userDetail: state.auth.userData,
    notification: state.common.notification
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    logoutRedux: (res) => dispatch(logoutAction(res)),
    addNotificationsActionRedux: (res) => dispatch(addNotificationsAction(res)),
    updateNotificationsCountActionRedux: (res) => dispatch(updateNotificationsCountAction(res)),
  }
}

AdminHeader.propTypes = {
  logoutRedux: PropTypes.func.isRequired,
  addNotificationsActionRedux: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  i18n: PropTypes.object.isRequired,
  userDetail: PropTypes.object.isRequired,
  notification: PropTypes.object.isRequired
}

export default withRouter(withTranslation()(connect(mapStateToProps, mapDispatchToProps)(AdminHeader)))
