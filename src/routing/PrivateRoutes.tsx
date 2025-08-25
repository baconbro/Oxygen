import { lazy, FC, Suspense } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { MasterLayout } from '../layout/MasterLayout'
import TopBarProgress from 'react-topbar-progress-indicator'
import { DashboardWrapper } from '../pages/dashboard/DashboardWrapper'
import { getCSSVariableValue } from '../utils/index'
import { WithChildren } from '../utils/index'
import { Workspacehome } from '../pages/Workspaces'
import CreateWorkspace from '../modules/onboarding/CreateWorkspace'
import Project from '../modules/Workspace'
import Goals from '../modules/Goals'
import GoalDetails from '../modules/Goals/GoalDetails'
import Onboarding from '../modules/onboarding/Onboarding'
import WorkspaceAcronymRedirect from './WorkspaceAcronymRedirect'

const PrivateRoutes = () => {
  const AccountPage = lazy(() => import('../modules/accounts/AccountPage'))
  const AdminPage = lazy(() => import('../modules/admin/AdminPage'))

  return (
    <Routes>
      <Route element={<MasterLayout />}>
        {/* Redirect to Dashboard after success login/registartion */}
        <Route path='auth/*' element={<Navigate to='/dashboard' />} />
        {/* Pages */}
        <Route path='dashboard' element={<DashboardWrapper />} />
        {/* Lazy Modules */}
        <Route
          path='people/myaccount/*'
          element={
            <SuspensedView>
              <AccountPage />
            </SuspensedView>
          }
        />
        <Route
          path='admin/*'
          element={
            <SuspensedView>
              <AdminPage />
            </SuspensedView>
          }
        />
        <Route
          path='workspace/'
          element={
            <SuspensedView>
              <Workspacehome />
            </SuspensedView>
          }
        />
        <Route
          path='workspace/:id/*'
          element={
            <SuspensedView>
              <Project />
            </SuspensedView>
          }
        />

        <Route
          path='w/:acronym'
          element={
            <SuspensedView>
              <WorkspaceAcronymRedirect />
            </SuspensedView>
          }
        />

        <Route
          path='goals/'
          element={
            <SuspensedView>
              <Goals />
            </SuspensedView>
          }
        />
        <Route
          path='goals/details/*'
          element={
            <SuspensedView>
              <GoalDetails />
            </SuspensedView>
          }
        />

        <Route
          path='onboarding/'
          element={
            <SuspensedView>
              <Onboarding />
            </SuspensedView>
          }
        />

        <Route
          path='create-workspace/'
          element={
            <SuspensedView>
              <CreateWorkspace />
            </SuspensedView>
          }
        />

        <Route path='*' element={<Navigate to='/error/404' />} />
      </Route>
    </Routes>
  )
}

const SuspensedView: FC<WithChildren> = ({ children }) => {
  const baseColor = getCSSVariableValue('--xgn-primary')
  TopBarProgress.config({
    barColors: {
      '0': baseColor,
    },
    barThickness: 1,
    shadowBlur: 5,
  })
  return <Suspense fallback={<TopBarProgress />}>{children}</Suspense>
}

export { PrivateRoutes }
