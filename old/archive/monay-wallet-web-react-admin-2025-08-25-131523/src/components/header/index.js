import React from 'react'
import { useSelector } from 'react-redux'
import { selectIsLoggedIn } from '../../redux/auth/authSlice'
import AdminHeader from '../adminHeader'
import { Link } from 'react-router-dom'
import { tagClassToggle } from '../../utilities/common'

export default function Header() {
  const isLoggedIn = useSelector(selectIsLoggedIn)
  return (
    <header className="adminHeader d-flex align-items-center justify-content-bwtween" id="header">
      {
        isLoggedIn && <div className="toggle-icon d-flex align-items-center justify-content-center">
          <Link
            id="menu"
            to=''
            onClick={(e) => {
              e.preventDefault();
              tagClassToggle('body', 'open-menu')
            }}
          >
            <span></span>
            <span></span>
            <span></span>
          </Link>
        </div>
      }
      <nav className="navbar w-100">
        <div className="logo">
          <Link className="navbar-brand navbar__brand" to="/">
            <img src="/assets/images/logo.png" className="img-fluid" alt="logo" />
          </Link>
        </div>
        {
          isLoggedIn && <AdminHeader />
        }
      </nav>
    </header>
  )
}
