import { Outlet } from 'react-router-dom'
import { AsideDefault } from './components/aside/AsideDefault'
import { Footer } from './components/Footer'
import { HeaderWrapper } from './components/header/HeaderWrapper'
import { Toolbar } from './components/toolbar/Toolbar'
import { Content } from './components/Content'
import { PageDataProvider } from './core'
import { ThemeModeProvider } from '../components/partials'
import { WorkspaceProvider } from '../contexts/WorkspaceProvider'

const MasterLayout = () => {

  return (
    <PageDataProvider>
      <ThemeModeProvider>
        <WorkspaceProvider>
          <div className='page d-flex flex-row flex-column-fluid'>
            <AsideDefault />
            <HeaderWrapper />
            <Toolbar />
            <div className='wrapper d-flex flex-column flex-row-fluid' id='xgn_wrapper'>
              <div id='xgn_content' className='content d-flex  flex-column-fluid'>
                <div className='post d-flex flex-column-fluid' id='xgn_post'>
                  <Content>
                    <Outlet />
                  </Content>
                </div>
              </div>
              <Footer />
            </div>
          </div>
        </WorkspaceProvider>
      </ThemeModeProvider>
    </PageDataProvider>
  )
}

export { MasterLayout }
