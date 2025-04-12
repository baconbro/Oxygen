import {FC, useEffect} from 'react'
import {useLocation} from 'react-router'
import clsx from 'clsx'
import {useLayout} from '../core'
import {DrawerComponent} from '../../components/common'
import {WithChildren} from '../../utils'
import {useAuth} from '../../modules/auth'
import {useWorkspace} from '../../contexts/WorkspaceProvider'
import {getOrgUsers} from '../../services/userServices'

const Content: FC<WithChildren> = ({children}) => {
  const {classes} = useLayout()
  const location = useLocation()
  const {currentUser} = useAuth()
  const {setOrgUsers} = useWorkspace()

  // Hide all drawers when location changes
  useEffect(() => {
    DrawerComponent.hideAll()
  }, [location])

  // Load organization users when currentUser changes
  useEffect(() => {
    async function loadOrgUsers() {
      if (currentUser?.all?.currentOrg) {
        try {
          // Fetch org users from the current user's organization
          const orgUsersData = await getOrgUsers(currentUser.all.currentOrg)
          
          // Update the workspace context with the org users
          setOrgUsers(orgUsersData)
        } catch (err) {
          console.error('Error loading organization users in Content component:', err)
        }
      }
    }
    
    loadOrgUsers()
  }, [currentUser?.all?.currentOrg, setOrgUsers])

  return (
    <div id='xgn_content_container' className={clsx(classes.contentContainer.join(' '))}>
      {children}
    </div>
  )
}

export {Content}
