import React from 'react'
import {Navigate, Route, Routes, Outlet} from 'react-router-dom'
import {PageLink, PageTitle} from '../../layout/core'
import AdminOverview from './components/Overview'
//import UsersPage from './components/UsersPage'
import { AdminHeader } from './AdminHeader'


const accountBreadCrumbs: Array<PageLink> = [
  {
    title: 'Admin',
    path: '/admin',
    isSeparator: false,
    isActive: false,
  },
  {
    title: '',
    path: '',
    isSeparator: true,
    isActive: false,
  },
]

const AccountPage: React.FC = () => {
  return (
    <Routes>
      <Route
        element={
          <>
          <AdminHeader/>
            <Outlet />
          </>
        }
      >
        <Route
          path='overview'
          element={
            <>
              <PageTitle breadcrumbs={accountBreadCrumbs}>Overview</PageTitle>
              <AdminOverview />
            </>
          }
        />
        <Route
          path='people'
          element={
            <>
              <PageTitle breadcrumbs={accountBreadCrumbs}>People</PageTitle>
             
            </>
          }
        />
        <Route index element={<Navigate to='/admin/overview' />} />
      </Route>
    </Routes>
  )
}

export default AccountPage
