import { useIntl } from 'react-intl'
import { AsideMenuItem } from './AsideMenuItem'
import { usePageData } from '../../core'

export function AsideMenuMain() {
  const intl = useIntl()
  const { pageSideMenu } = usePageData()

  return (
    <>
      {pageSideMenu &&
        pageSideMenu.length > 0 &&
        <>
          <div className='menu-item'>
            <div className='menu-content pt-8 pb-2'>
              <span className='menu-section text-muted text-uppercase fs-8 ls-1'>Views history</span>
            </div>
          </div>
          {Array.from(pageSideMenu).slice(0, 10).map((item, index) => (
            <span key={index}>
              <AsideMenuItem
                to={item.to}
                icon={item.icon}
                title={item.title}
                fontIcon={item.fontIcon}
              />
            </span>
          ))}
        </>}
    </>
  )
}
