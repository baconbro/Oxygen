import { useIntl } from 'react-intl'

import { ToolbarMenuItem } from './ToolbarMenuItem'
import { usePageData } from '../../core'

export function ToolbarMenuMain() {
  const intl = useIntl()
  const { pageInnerNavigation } = usePageData()

  return (
    <>
      {pageInnerNavigation &&
        pageInnerNavigation.length > 0 &&
        <div className='d-flex align-items-stretch '>
          <ul className="nav nav-stretch nav-line-tabs flex-grow-1 fs-5 fw-semibold">
            {Array.from(pageInnerNavigation).map((item, index) => (
              <span key={index}>
                <ToolbarMenuItem
                  to={item.to}
                  icon={item.icon}
                  title={item.title}
                  fontIcon={item.fontIcon}
                  isNew={false}
                />
              </span>
            ))}
          </ul>
        </div>}

    </>
  )
}
