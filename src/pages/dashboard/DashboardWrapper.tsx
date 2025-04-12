import { useIntl } from 'react-intl'
import { PageTitle } from '../../layout/core'
import { LastWeek } from './Components/LastWeek'
import { MyWork } from './Components/MyWork'
import { useAuth } from '../../modules/auth'
import { Avatar } from '../../components/common'
import { useWorkspace } from '../../contexts/WorkspaceProvider'
import { useGetOrgUsers } from '../../services/userServices'
import { useEffect } from 'react'


const DashboardWrapper = () => {
  const intl = useIntl()
  const { currentUser } = useAuth()
  const {setOrgUsers} = useWorkspace();

  // Fetch organization users silently in the background
  const { data: orgUsers, status } = useGetOrgUsers(currentUser?.all?.currentOrg)

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

  return (
    <>
      <PageTitle breadcrumbs={[]}>{intl.formatMessage({ id: 'MENU.DASHBOARD' })}</PageTitle>
      
      {/* User greeting section */}
      <div className="card mb-5">
        <div className="card-body py-3">
          <div className="d-flex align-items-center">
            <div className="symbol symbol-70px me-5">
              <Avatar 
                name={currentUser?.all?.fName} 
                avatarUrl={currentUser?.all.photoURL} 
                size={70} 
                className="" 
              />
            </div>
            <div>
              <h2 className="fs-2 fw-bolder mb-1">
                {getGreeting()}, {currentUser?.all?.fName || 'User'}!
              </h2>
              <p className="text-gray-600 fs-6">
                Welcome to your dashboard. Here's a summary of your recent activity.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* My Work section */}
      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
        <div className="col-12">
          <MyWork />
        </div>
      </div>
      
      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
        <LastWeek />
      </div>
    </>
  )
}

export { DashboardWrapper }
