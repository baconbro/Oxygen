import { useIntl } from 'react-intl'
import { AsideMenuItem } from './AsideMenuItem'
import { usePageData } from '../../core'
import { useState } from 'react'

// Define the proper type for menu items including submenu
interface MenuItem {
  title: string
  to: string
  icon?: string
  fontIcon?: string
  position?: number
  submenu?: MenuItem[]
}

export function AsideMenuMain() {
  const intl = useIntl()
  const { pageSideMenu } = usePageData()
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({})

  const toggleSubmenu = (menuTitle: string, event: React.MouseEvent) => {
    event.preventDefault() // Prevent navigation when clicking the parent menu
    event.stopPropagation() // Stop event bubbling
    setExpandedMenus(prev => ({
      ...prev,
      [menuTitle]: !prev[menuTitle]
    }))
  }

  return (
    <>
      {pageSideMenu &&
        pageSideMenu.length > 0 &&
        <>
          <div className='menu-item'>
            <div className='menu-content pt-8 pb-2'>
              <span className='menu-section text-muted text-uppercase fs-8 ls-1'>Menu</span>
            </div>
          </div>
          {Array.from(pageSideMenu as MenuItem[]).slice(0, 10).map((item, index) => (
            <span key={index}>
              {item.submenu && item.submenu.length > 0 ? (
                <>
                  <div className='menu-item menu-accordion' data-kt-menu-trigger='click'>
                    <span 
                      className='menu-link'
                      onClick={(e) => toggleSubmenu(item.title, e)}
                    >
                      {item.icon && <span className='menu-icon'><i className={item.icon}></i></span>}
                      <span className='menu-title'>{item.title}</span>
                      <span className='menu-arrow'></span>
                    </span>
                    <div className={`menu-sub menu-sub-accordion ${expandedMenus[item.title] ? 'show' : ''}`}>
                      {expandedMenus[item.title] && item.submenu.map((subItem, subIndex) => (
                        <div className='menu-item' key={`${index}-${subIndex}`}>
                          <a className='menu-link' href={subItem.to}>
                            {subItem.icon && <span className='menu-bullet'><span className={subItem.icon}></span></span>}
                            <span className='menu-title'>{subItem.title}</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <AsideMenuItem
                  to={item.to}
                  icon={item.icon}
                  title={item.title}
                  fontIcon={item.fontIcon}
                />
              )}
            </span>
          ))}
        </>}
    </>
  )
}
