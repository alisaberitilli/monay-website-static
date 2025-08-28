import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

const mapRoutesToItems = (bredcrumbs) => {
  return bredcrumbs.map((bredcrumb, idx) => {
    if (bredcrumb.path && bredcrumbs.length !== (idx + 1)) {
      return <li key={idx} className='breadcrumb-item'>
        {' '}
        <Link to={bredcrumb.path}>{bredcrumb.name}</Link>{' '}
      </li>
    } else {
      return <li key={idx} className='breadcrumb-item active' aria-current='page'>
        {bredcrumb.name}
      </li>
    }
  })
}

const BreadCrumb = ({ bredcrumbs }) => {
  return (
    <nav aria-label='breadcrumb'>
      <ol className='breadcrumb'>
        {mapRoutesToItems(bredcrumbs)}
      </ol>
    </nav>
  )
}

BreadCrumb.propTypes = {
  bredcrumbs: PropTypes.array.isRequired
}

export default BreadCrumb
