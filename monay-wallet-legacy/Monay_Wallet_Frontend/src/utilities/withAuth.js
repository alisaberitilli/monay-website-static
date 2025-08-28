import React, { PureComponent } from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import {
  redirectPathIfRequireAuthFails,
  redirectPathIfNotRequireAuthFails,
  routesJSON
} from './routes'
import { getSessionStorageToken } from './common'
import { logoutAction } from '../redux/auth/authSlice'
import modalNotification from './notifications'
import { GlobalLoader } from '../components/common'

export default function (ComposedComponent) {
  class WithAuth extends PureComponent {
    constructor(props) {
      super(props)

      this.state = {
        isAuthenticate: false
      }
    }

    componentDidMount() {
      this.checkAuth()
    }

    componentDidUpdate(prevProps, prevState) {
      if (prevProps.auth.isLoggedIn !== this.props.auth.isLoggedIn) {
        this.setState(
          {
            isAuthenticate: false
          },
          () => {
            this.checkAuth()
          }
        )
      }
    }

    checkAuth = () => {
      const isLoggedInProp = this.props.auth.isLoggedIn
      const userType = this.props.auth.userData.userType
      const permissions = this.props.auth.userData.UserRole
      const path = this.props.match.path
      const routePaths = this.getRouteArray(userType, true)
      const notRequireAuthPaths = this.getRouteArray(userType, false)

      if (routePaths.includes(path) && !isLoggedInProp) {
        this.props.history.push({
          pathname: redirectPathIfRequireAuthFails[0]
        })
      } else if (
        (
          notRequireAuthPaths.includes(path) ||
          !routePaths.includes(path)
        ) && isLoggedInProp
      ) {
        if (getSessionStorageToken()) {
          if (userType === 'subadmin') {
            if (permissions) {
              let moduleKey = permissions.RolePermissions[0].moduleKey;
              const routes = routesJSON((arg) => arg, this.props.auth.userData.permissions);
              let firstRoute = routes.find(item => {
                return item.moduleKey === moduleKey;
              });
              this.props.history.push({
                pathname: firstRoute.endPoint
              })

            }
          } else {
            this.props.history.push({
              pathname: this.redirectOn(userType)
            })
          }
        } else {
          modalNotification({
            type: 'error',
            message: 'Logout',
            description: 'Session Expired'
          })
          this.props.logoutRedux()
        }
      } else {
        this.setState({
          isAuthenticate: true
        })
      }
    };

    getRouteArray = (type = 'all', authReq) => {
      // const routes = routesJSON()
      const routes = routesJSON((arg) => arg, this.props.auth.userData.permissions)
      let pathArr = []
      for (let index = 0; index < routes.length; index++) {
        const element = routes[index];
        if (element.child && element.child.length > 0) {
          for (let indexJ = 0; indexJ < element.child.length; indexJ++) {
            const elementJ = element.child[indexJ];
            if (
              elementJ.userTypes &&
              (elementJ.userTypes.includes(type) || type === 'all') &&
              elementJ.authRequire === authReq
            ) {
              pathArr.push(elementJ.endPoint)
            }
          }
        } else {
          if (
            element.userTypes &&
            (element.userTypes.includes(type) || type === 'all') &&
            element.authRequire === authReq
          ) {
            pathArr.push(element.endPoint)
          }
        }
      }
      return pathArr
    }

    redirectOn = (type) => {
      let redirectOn = ''
      for (let index = 0; index < redirectPathIfNotRequireAuthFails.length; index++) {
        const element = redirectPathIfNotRequireAuthFails[index];
        if (element.userTypes && element.userTypes.includes(type)) {
          redirectOn = element.path
        }
      }
      return redirectOn
    }

    render() {
      const { isAuthenticate } = this.state

      if (isAuthenticate) {
        return (
          <>
            <ComposedComponent {...this.props} />
          </>
        )
      }

      return <GlobalLoader />
    }
  }

  const mapStateToProps = (state) => {
    return {
      auth: state.auth
    }
  }

  const mapDispatchToProps = (dispatch) => {
    return {
      logoutRedux: (res) => dispatch(logoutAction(res))
    }
  }

  WithAuth.propTypes = {
    auth: PropTypes.object.isRequired,
    logoutRedux: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  }

  return withRouter(connect(mapStateToProps, mapDispatchToProps)(WithAuth))
}
