/* eslint-disable jsx-a11y/anchor-is-valid */
import { FC } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../../modules/auth'


const HeaderUserMenu: FC = () => {
  const { currentUser, logout } = useAuth()
  return (
    <div
      className='menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-275px'
      data-xgn-menu='true'
    >
      <div className='menu-item px-3'>
        <div className='menu-content d-flex align-items-center px-3'>
          <div className='avatar avatar-50px me-5'>

          </div>

          <div className='d-flex flex-column'>
            <div className='fw-bolder d-flex align-items-center fs-5'>
              {currentUser?.all?.fName} {currentUser?.all?.lName}
             
            </div>
            <a href='#' className='fw-bold text-muted text-hover-primary fs-7'>
              {currentUser?.email}
            </a>
          </div>
        </div>
      </div>

      <div className='separator my-2'></div>

      {/* <Organisations /> */}

      <div className='separator my-2'></div>

      {/* <Languages /> */}

      <div className='menu-item px-5 my-1'>
        <Link to='/people/myaccount/settings' className='menu-link px-5'>
          Account Settings
        </Link>
      </div>
      <div className='menu-item px-5 my-1'>
        <Link to='/admin/' className='menu-link px-5'>
          Admin  <span className='badge badge-light-primary fw-bolder fs-8 px-2 py-1 ms-2'>Free plan</span>
        </Link>
      </div>

      <div className='menu-item px-5'>
        <a onClick={logout} className='menu-link px-5'>
          Sign Out
        </a>
      </div>
    </div>
  )
}

export { HeaderUserMenu }
