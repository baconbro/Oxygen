import { DefaultTitle } from '../../layout/components/header/page-title/DefaultTitle'
import { ToolbarMenuMain } from '../../layout/components/toolbar/ToolbarMenuMain'


const Toolbar = () => {


  return (
    <>
      <div className='toolbar' id='xgn_toolbar'>
        <div id='xgn_toolbar_container' className='container-fluid d-flex flex-column'>
          {/* Top Section */}
          <div className='d-flex flex-stack'>
            <DefaultTitle />
          </div>
          <div className='d-flex flex-stack'>
          </div>
          {/* Bottom Section */}
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
