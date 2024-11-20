/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import {InlineSVG} from '../../utils'
import {Link} from 'react-router-dom'
import {useLocation} from 'react-router'
import { useAuth } from '../auth'
import { toAbsoluteUrl } from '../../utils'

const AdminHeader: React.FC = () => {
  const location = useLocation()
  const {currentUser, logout} = useAuth()

  return (
    <div className='card mb-5 mb-xl-10'>
      <div className='card-body pt-9 pb-0'>

        <div className='d-flex overflow-auto h-55px'>
          <ul className='nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-5 fw-bolder flex-nowrap'>
            <li className='nav-item'>
              <Link
                className={
                  `nav-link text-active-primary me-6 ` +
                  (location.pathname === '/admin/overview' && 'active')
                }
                to='/admin/overview'
              >
                Overview
              </Link>
            </li>
            <li className='nav-item'>
{/*               <Link
                className={
                  `nav-link text-active-primary me-6 ` +
                  (location.pathname === '/admin/people' && 'active')
                }
                to='/admin/people'
              >
                People
              </Link> */}
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export {AdminHeader}
