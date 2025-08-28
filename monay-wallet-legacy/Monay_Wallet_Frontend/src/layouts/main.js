import React from 'react'
import PropTypes from 'prop-types'
import Header from '../components/header'
import Sidebar from '../components/sidebar'
import { connect } from 'react-redux'

const MainLayout = (props) => {
  const { children, isLoggedIn } = props
  return (
    <>
      <Header />
      {
        isLoggedIn && <Sidebar />
      }
      {children}
    </>
  )
}

MainLayout.propTypes = {
  children: PropTypes.any.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
}

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.auth.isLoggedIn
  }
}

const mapDispatchToProps = (dispatch) => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(MainLayout)
