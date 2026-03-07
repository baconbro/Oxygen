import { DefaultTitle } from '../../layout/components/header/page-title/DefaultTitle'
import { ToolbarMenuMain } from '../../layout/components/toolbar/ToolbarMenuMain'
import { usePageData } from '../../layout/core'


const Toolbar = () => {
  const { pageTitle, pageInnerNavigation } = usePageData()

  // Don't render the toolbar when there's no content to show (e.g. Goals, Dashboard)
  if (!pageTitle && (!pageInnerNavigation || pageInnerNavigation.length === 0)) {
    return null
  }

  return (
    <>
      <div className='toolbar' id='xgn_toolbar'>
        <div id='xgn_toolbar_container' className='container-fluid d-flex flex-column'>
          <div className='d-flex flex-stack'>
            <DefaultTitle />
          </div>
          <div className='d-flex flex-stack'>
          </div>
          <div className='d-flex align-items-center'>
            <div className='me-4'>
              <ToolbarMenuMain />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export { Toolbar }
