import { useIntl } from 'react-intl'
import { useState, useEffect } from 'react'
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
import { Favorites } from './Components/Favorites'
import { WorkloadIndicator } from './Components/WorkloadIndicator'
import { DashboardCustomizer } from './Components/DashboardCustomizer'
import { QuickCreate } from './Components/QuickCreate'
import { CommandPalette } from '../../components/common/CommandPalette'
import { useAuth } from '../../modules/auth'
import { Avatar } from '../../components/common'
import { useWorkspace } from '../../contexts/WorkspaceProvider'
import { useGetOrgUsers } from '../../services/userServices'
import { useGetAssignedTasks, useGetActiveSprints, useGetDashboardConfig } from '../../services/dashboardServices'


const DashboardWrapper = () => {
  const intl = useIntl()
  const { currentUser } = useAuth()
  const { setOrgUsers } = useWorkspace()

  const userId = currentUser?.all?.uid
  const orgId = currentUser?.all?.currentOrg || (currentUser?.orgs && currentUser?.orgs[0])

  // Fetch organization users silently in the background
  const { data: orgUsers } = useGetOrgUsers(orgId)

  // Fetch assigned tasks for dashboard widgets
  const { data: assignedTasks = [] as any[], isLoading: tasksLoading } = useGetAssignedTasks(
    userId || "",
    orgId || ""
  )

  // Fetch active sprints
  const { data: activeSprints = [] as any[], isLoading: sprintsLoading } = useGetActiveSprints(orgId)

  // Fetch dashboard configuration
  const { data: savedConfig } = useGetDashboardConfig(userId)
  const [dashboardConfig, setDashboardConfig] = useState<{ hiddenWidgets: string[], compactMode: boolean }>({ hiddenWidgets: [], compactMode: false })

  // Update config when saved config loads
  useEffect(() => {
    if (savedConfig) {
      setDashboardConfig(savedConfig as { hiddenWidgets: string[], compactMode: boolean })
    }
  }, [savedConfig])

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

  // Check if widget is visible
  const isVisible = (widgetId: string) => {
    return !dashboardConfig.hiddenWidgets?.includes(widgetId)
  }

  // Handle config change from customizer
  const handleConfigChange = (newConfig: any) => {
    setDashboardConfig(newConfig)
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
            <div className="d-flex align-items-center gap-3">
              <div className="d-none d-md-block">
                <span className="badge badge-light-primary fs-7 px-4 py-2">
                  <i className="bi bi-search me-2"></i>
                  <kbd className="bg-primary text-white border-0 mx-1">Ctrl+K</kbd>
                </span>
              </div>
              <DashboardCustomizer onConfigChange={handleConfigChange} />
            </div>
          </div>
        </div>
      </div>

      {/* Focus Today - Full width, highest priority */}
      {isVisible('focusToday') && (
        <div className="row g-5 g-xl-8 mb-5">
          <div className="col-12">
            <FocusToday tasks={assignedTasks as any} isLoading={tasksLoading} />
          </div>
        </div>
      )}

      {/* Sprint Progress + Goals + Blocked Items - 3 column layout */}
      {(isVisible('sprintProgress') || isVisible('goalsProgress') || isVisible('blockedItems')) && (
        <div className="row g-5 g-xl-8 mb-5">
          {isVisible('sprintProgress') && (
            <div className="col-xl-4 col-lg-6">
              <SprintProgress
                tasks={assignedTasks as any}
                sprints={activeSprints as any}
                workspaceId={activeSprints[0]?.workspaceId as any}
                isLoading={sprintsLoading}
              />
            </div>
          )}
          {isVisible('goalsProgress') && (
            <div className="col-xl-4 col-lg-6">
              <GoalsProgress />
            </div>
          )}
          {isVisible('blockedItems') && (
            <div className="col-xl-4 col-lg-12">
              <BlockedItems />
            </div>
          )}
        </div>
      )}

      {/* Activity Feed + Waiting for Review + Recently Viewed - 3 column layout */}
      {(isVisible('activityFeed') || isVisible('waitingForReview') || isVisible('recentlyViewed')) && (
        <div className="row g-5 g-xl-8 mb-5">
          {isVisible('activityFeed') && (
            <div className="col-xl-4 col-lg-6">
              <ActivityFeed />
            </div>
          )}
          {isVisible('waitingForReview') && (
            <div className="col-xl-4 col-lg-6">
              <WaitingForReview />
            </div>
          )}
          {isVisible('recentlyViewed') && (
            <div className="col-xl-4 col-lg-12">
              <RecentlyViewed />
            </div>
          )}
        </div>
      )}

      {/* Favorites + Workload - 2 column layout */}
      {(isVisible('favorites') || isVisible('workload')) && (
        <div className="row g-5 g-xl-8 mb-5">
          {isVisible('favorites') && (
            <div className="col-xl-6 col-lg-6">
              <Favorites />
            </div>
          )}
          {isVisible('workload') && (
            <div className="col-xl-6 col-lg-6">
              <WorkloadIndicator />
            </div>
          )}
        </div>
      )}

      {/* My Work section - Full width */}
      {isVisible('myWork') && (
        <div className="row g-5 g-xl-8 mb-5">
          <div className="col-12">
            <MyWork />
          </div>
        </div>
      )}

      {/* Quick stats - Last week metrics */}
      {isVisible('lastWeek') && (
        <div className="row g-5 g-xl-8 mb-5">
          <LastWeek />
        </div>
      )}

      {/* Quick Create FAB */}
      <QuickCreate />

      {/* Command Palette - Global Search */}
      <CommandPalette />
    </>
  )
}

export { DashboardWrapper }
