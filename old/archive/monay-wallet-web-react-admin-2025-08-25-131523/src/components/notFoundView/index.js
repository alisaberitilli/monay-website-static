import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsLoggedIn } from '../../redux/auth/authSlice'

export default function NotFoundView() {
  const isLoggedIn = useSelector(selectIsLoggedIn)
  return (
    <main className='mainContent error-page p-0'>
      <div id='notfound'>
        <div className='notfound'>
          <div className='notfound-404'>
            <h1>Oops!</h1>
            <h2>404 - The Page {'can\'t'} be found</h2>
          </div>
          <Link to='/' className='btn btn-primary text-uppercase font-md'>{
            isLoggedIn ? 'Go TO Homepage' : 'Go To Login'
          }</Link>
        </div>
      </div>
    </main>
  )
}
