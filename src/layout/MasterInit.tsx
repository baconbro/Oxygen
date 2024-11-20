import {useEffect, useRef} from 'react'
import {
  MenuComponent,
  DrawerComponent,
  StickyComponent,
} from '../components/common'
import { ThemeModeComponent } from '../layout'

import {useLayout} from './core'

export function MasterInit() {
  const {config} = useLayout()
  const isFirstRun = useRef(true)
  const pluginsInitialization = () => {
    isFirstRun.current = false
    ThemeModeComponent.init()
    setTimeout(() => {
      DrawerComponent.bootstrap()
      StickyComponent.bootstrap()
      MenuComponent.bootstrap()
    }, 500)
  }

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      pluginsInitialization()
    }
  }, [config])

  return <></>
}
