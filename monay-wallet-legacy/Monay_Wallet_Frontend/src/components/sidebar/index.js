import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { tagClassToggle, currentTimeStamp } from '../../utilities/common'
import { routesJSON } from '../../utilities/routes'

const Sidebar = ({ match, userType, userData }) => {
  const { t } = useTranslation()

  const path = match.path

  const toggleDrawerMenu = () => {
    const element = document.getElementsByTagName('body')[0]
    if (element.classList.contains('open-menu')) {
      tagClassToggle('body', 'open-menu')
    }
  }

  return (
    <>
      <div
        className='overlay-screen'
        onClick={(e) => {
          e.preventDefault()
          toggleDrawerMenu()
        }}
      ></div>
      <aside className="sidemenu" id="sidemenu">
        <div className="sidebar-wrapper" id="sidebarMscroll">
          <ul id="sideSubMenu" className="nav flex-column sidenav">
            {
              routesJSON(t, userData.permissions).map((data, index) => {
                if (data.userTypes.includes(userType) && data.addInSideBar) {
                  if (data.child && data.child.length > 0) {
                    return <li key={`${currentTimeStamp()}_${index}`} className={data.active.includes(path) ? 'active' : ''}>
                      <Link
                        to='#'
                        className={`nav-link ripple-effect ${data.active.includes(path) ? '' : 'collapsed'}`}
                        data-toggle='collapse'
                        data-target={`#${data.endPoint}`}
                        aria-expanded={data.active.includes(path)}
                      >
                        <span className='nav_icon d-flex align-items-center justify-content-center'>
                          <i className={data.icon}></i>
                        </span>
                        <span className='nav_title'>{data.title}</span>
                      </Link>
                      <ul
                        className={`list-unstyled collapse in-collapse ${data.active.includes(path) ? 'show' : ''}`}
                        id={data.endPoint}
                      >
                        {
                          data.child.map((childData, childId) => {
                            if (childData.userTypes.includes(userType) && childData.addInSideBar) {
                              return <li key={`${currentTimeStamp()}_${index}_${childId}`} className={childData.active.includes(path) ? 'active' : ''}>
                                <Link
                                  className='nav-link'
                                  to={childData.endPoint}
                                  onClick={(e) => {
                                    toggleDrawerMenu()
                                  }}
                                >
                                  <span className='nav__title'>{childData.title}</span>
                                </Link>
                              </li>
                            }
                            return false
                          })
                        }
                      </ul>
                    </li>
                  } else {
                    if (userType === 'admin') {
                      return <li key={`${currentTimeStamp()}_${index}`} className={data.active.includes(path) ? 'active' : ''}>
                        <Link
                          className='nav-link ripple-effect'
                          to={data.endPoint}
                          onClick={(e) => {
                            toggleDrawerMenu()
                          }}
                        >
                          <span className='nav_icon d-flex align-items-center justify-content-center'>
                            <i className={data.icon}></i>
                          </span>
                          <span className='nav_title'>{data.title}</span>
                        </Link>
                      </li>
                    } else {

                      if (userData.permissions) {
                        let moduleKeyIndex = userData.permissions.findIndex(item => {
                          return item.moduleKey === data.moduleKey
                        });
                        if (moduleKeyIndex > -1) {
                          return <li key={`${currentTimeStamp()}_${index}`} className={data.active.includes(path) ? 'active' : ''}>
                            <Link
                              className='nav-link ripple-effect'
                              to={data.endPoint}
                              onClick={(e) => {
                                toggleDrawerMenu()
                              }}
                            >
                              <span className='nav_icon d-flex align-items-center justify-content-center'>
                                <i className={data.icon}></i>
                              </span>
                              <span className='nav_title'>{data.title}</span>
                            </Link>
                          </li>
                        }
                      }
                    }
                  }
                }
                return false
              })
            }
          </ul>
        </div>
      </aside>
    </>
  )
}

const mapStateToProps = (state) => {
  return {
    userType: state.auth.userData.userType || '',
    userData: state.auth.userData || ''
  }
}

Sidebar.propTypes = {
  match: PropTypes.object.isRequired,
  userType: PropTypes.string.isRequired
}

export default withRouter(connect(mapStateToProps, null)(Sidebar))
