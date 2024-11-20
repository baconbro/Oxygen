import {FC, createContext, useContext, useState, useEffect} from 'react'
import {DefaultLayoutConfig} from './DefaultLayoutConfig'
import {
  getEmptyCssClasses,
  getEmptyCSSVariables,
  getEmptyHTMLAttributes,
  LayoutSetup,
} from './LayoutSetup'
import {
  ILayout,
  ILayoutCSSVariables,
  ILayoutCSSClasses,
  ILayoutHTMLAttributes,
} from './LayoutModels'
import {WithChildren} from '../../utils'

export interface LayoutContextModel {
  config: ILayout
  classes: ILayoutCSSClasses
  attributes: ILayoutHTMLAttributes
  cssVariables: ILayoutCSSVariables
  setLayout: (config: LayoutSetup) => void
}

const LayoutContext = createContext<LayoutContextModel>({
  config: DefaultLayoutConfig,
  classes: getEmptyCssClasses(),
  attributes: getEmptyHTMLAttributes(),
  cssVariables: getEmptyCSSVariables(),
  setLayout: (config: LayoutSetup) => {
    throw new Error('Function not implemented.')
  },
})

const disableSplashScreen = () => {
  const splashScreen = document.getElementById('splash-screen')
  if (splashScreen) {
    splashScreen.style.setProperty('display', 'none')
  }
}

const LayoutProvider: FC<WithChildren> = ({children}) => {
    const value: LayoutContextModel = {
      "config": {
        "main": {
          "type": "default",
          "primaryColor": "#009EF7",
          "darkSkinEnabled": true
        },
        "loader": {
          "display": true,
          "type": "default"
        },
        "scrolltop": {
          "display": true
        },
        "header": {
          "display": true,
          "width": "fluid",
          "left": "menu",
          "fixed": {
            "desktop": true,
            "tabletAndMobile": true
          },
          "menuIcon": "svg"
        },
        "megaMenu": {
          "display": true
        },
        "aside": {
          "display": true,
          "theme": "dark",
          "menu": "main",
          "fixed": true,
          "minimized": false,
          "minimize": true,
          "hoverable": true,
          "menuIcon": "svg"
        },
        "content": {
          "width": "fixed",
          "layout": "default"
        },
        "toolbar": {
          "display": true,
          "width": "fluid",
          "fixed": {
            "desktop": true,
            "tabletAndMobileMode": true
          },
          "layout": "toolbar1",
          "layouts": {
            "toolbar1": {
              "height": "55px",
              "heightAndTabletMobileMode": "55px"
            },
            "toolbar2": {
              "height": "55px",
              "heightAndTabletMobileMode": "55px"
            },
            "toolbar3": {
              "height": "55px",
              "heightAndTabletMobileMode": "55px"
            },
            "toolbar4": {
              "height": "55px",
              "heightAndTabletMobileMode": "55px"
            },
            "toolbar5": {
              "height": "55px",
              "heightAndTabletMobileMode": "55px"
            }
          }
        },
        "footer": {
          "width": "fluid"
        },
        "pageTitle": {
          "display": true,
          "breadCrumbs": true,
          "description": false,
          "layout": "default",
          "direction": "row",
          "responsive": true,
          "responsiveBreakpoint": "lg",
          "responsiveTarget": "#xgn_toolbar_container"
        }
      },
      "classes": {
        "header": [],
        "headerContainer": [
          "container-fluid"
        ],
        "headerMobile": [],
        "headerMenu": [],
        "aside": [
          "aside-dark",
          "aside-hoverable"
        ],
        "asideMenu": [],
        "asideToggle": [],
        "toolbar": [],
        "toolbarContainer": [
          "container-fluid"
        ],
        "content": [],
        "contentContainer": [
          "container-fluid"
        ],
        "footerContainer": [
          "container-fluid"
        ],
        "sidebar": [],
        "pageTitle": [
          "align-items-center",
          "flex-wrap",
          "me-3",
          "mb-5",
          "mb-lg-0"
        ]
      },
      "attributes": {
        "asideMenu": new Map<string, string | number | boolean>(),
        "headerMobile": new Map<string, string | number | boolean>(),
        "headerMenu": new Map<string, string | number | boolean>(),
        "headerContainer": new Map<string, string | number | boolean>(),
        "pageTitle": new Map<string, string | number | boolean>()
      },
      "cssVariables": {
        "body": new Map<string, string | number | boolean>()
      },
      setLayout: function (config: LayoutSetup): void {
        throw new Error('Function not implemented.')
      }
    }

  useEffect(() => {
    disableSplashScreen()
  }, [])

  return <LayoutContext.Provider 
  value={value}>{children}
  </LayoutContext.Provider>
}

export {LayoutContext, LayoutProvider}

export function useLayout() {
  return useContext(LayoutContext)
}

