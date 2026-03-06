import { useIntl } from 'react-intl'
import { PageTitle } from '../../layout/core'
import { LastWeek } from './Components/LastWeek'
import { MyWork } from './Components/MyWork'
import { FocusToday } from './Components/FocusToday'
import { RecentlyViewed } from './Components/RecentlyViewed'
import { SprintProgress } from './Components/SprintProgress'
import { GoalsProgress } from './Components/GoalsProgress'
import { ActivityFeed } from './Components/ActivityFeed'
import { BlockedItems } from './Components/BlockedItems'
import { WaitingForReview } from './Components/WaitingForReview'
import { QuickCreate } from './Components/QuickCreate'
import { CommandPalette } from '../../components/common/CommandPalette'
import { useAuth } from '../../modules/auth'
import { Avatar } from '../../components/common'
import { useWorkspace } from '../../contexts/WorkspaceProvider'
import { useGetOrgUsers } from '../../services/userServices'
import { useGetAssignedTasks, useGetActiveSprints } from '../../services/dashboardServices'
import { useEffect } from 'react'


const DashboardWrapper = () => {
  const intl = useIntl()
  const { currentUser } = useAuth()
  const { setOrgUsers } = useWorkspace()

  const userId = currentUser?.all?.uid
  const orgId = currentUser?.all?.currentOrg || (currentUser?.orgs && currentUser?.orgs[0])

  // Fetch organization users silently in the background
  const { data: orgUsers } = useGetOrgUsers(orgId)

  // Fetch assigned tasks for dashboard widgets
  const { data: assignedTasks = [], isLoading: tasksLoading } = useGetAssignedTasks(
    userId || "",
    orgId || "",
    { enabled: !!userId && !!orgId }
  )

  // Fetch active sprints
  const { data: activeSprints = [], isLoading: sprintsLoading } = useGetActiveSprints(orgId)

  // Update org users when data is available
  useEffect(() => {
    if (orgUsers) {
      setOrgUsers(orgUsers)
    }
  }, [orgUsers, setOrgUsers])

  // Function to determine greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  // Get current date formatted
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <>
      <PageTitle breadcrumbs={[]}>{intl.formatMessage({ id: 'MENU.DASHBOARD' })}</PageTitle>

      {/* User greeting section - more compact */}
      <div className="card mb-5">
        <div className="card-body py-4">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div className="symbol symbol-50px me-4">
                <Avatar
                  name={currentUser?.all?.fName}
                  avatarUrl={currentUser?.all.photoURL}
                  size={50}
                  className=""
                />
              </div>
              <div>
                <h2 className="fs-3 fw-bolder mb-0">
                  {getGreeting()}, {currentUser?.all?.fName || 'User'}
                </h2>
                <p className="text-muted fs-7 mb-0">
                  {getCurrentDate()}
                </p>
              </div>
            </div>
            <div className="d-none d-md-block">
              <span className="badge badge-light-primary fs-7 px-4 py-2">
                <i className="bi bi-search me-2"></i>
                Press <kbd className="bg-primary text-white border-0 mx-1">Ctrl+K</kbd> to search & navigate
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Focus Today - Full width, highest priority */}
      <div className="row g-5 g-xl-8 mb-5">
        <div className="col-12">
          <FocusToday tasks={assignedTasks} isLoading={tasksLoading} />
        </div>
      </div>

      {/* Sprint Progress + Goals + Blocked Items - 3 column layout */}
      <div className="row g-5 g-xl-8 mb-5">
        <div className="col-xl-4 col-lg-6">
          <SprintProgress
            tasks={assignedTasks}
            sprints={activeSprints}
            workspaceId={activeSprints[0]?.workspaceId}
            isLoading={sprintsLoading}
          />
        </div>
        <div className="col-xl-4 col-lg-6">
          <GoalsProgress />
        </div>
        <div className="col-xl-4 col-lg-12">
          <BlockedItems />
        </div>
      </div>

      {/* Activity Feed + Waiting for Review + Recently Viewed - 3 column layout */}
      <div className="row g-5 g-xl-8 mb-5">
        <div className="col-xl-4 col-lg-6">
          <ActivityFeed />
        </div>
        <div className="col-xl-4 col-lg-6">
          <WaitingForReview />
        </div>
        <div className="col-xl-4 col-lg-12">
          <RecentlyViewed />
        </div>
      </div>

      {/* My Work section - Full width */}
      <div className="row g-5 g-xl-8 mb-5">
        <div className="col-12">
          <MyWork />
        </div>
      </div>

      {/* Quick stats - Last week metrics */}
      <div className="row g-5 g-xl-8 mb-5">
        <LastWeek />
      </div>

      {/* Quick Create FAB */}
      <QuickCreate />

      {/* Command Palette - Global Search */}
      <CommandPalette />
    </>
  )
}

export { DashboardWrapper }
