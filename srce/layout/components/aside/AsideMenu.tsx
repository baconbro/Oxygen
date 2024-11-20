import React, {useRef, useEffect} from 'react'
import {useLocation} from 'react-router'
import clsx from 'clsx'
import {AsideMenuMain} from './AsideMenuMain'
import {DrawerComponent,ToggleComponent} from '../../../components/common'

type Props = {
  asideMenuCSSClasses: string[]
}

const AsideMenu: React.FC<Props> = ({asideMenuCSSClasses}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const {pathname} = useLocation()

  useEffect(() => {
    setTimeout(() => {
      DrawerComponent.reinitialization()
      ToggleComponent.reinitialization() 
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0
      }
    }, 50)
  }, [pathname])

  return (
    <div
      id='xgn_aside_menu_wrapper'
      ref={scrollRef}
      className='hover-scroll-overlay-y my-5 my-lg-5'
      data-xgn-scroll='true'
      data-xgn-scroll-activate='{default: false, lg: true}'
      data-xgn-scroll-height='auto'
      data-xgn-scroll-dependencies='#xgn_aside_logo, #xgn_aside_footer'
      data-xgn-scroll-wrappers='#xgn_aside_menu'
      data-xgn-scroll-offset='0'
    >
      <div
        id='#xgn_aside_menu'
        data-xgn-menu='true'
        className={clsx(
          'menu menu-column menu-title-gray-800 menu-state-title-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-500',
          asideMenuCSSClasses.join(' ')
        )}
      >
        <AsideMenuMain />
      </div>
    </div>
  )
}

export {AsideMenu}
