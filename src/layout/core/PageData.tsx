/* eslint-disable react-hooks/exhaustive-deps */
import React, {FC, createContext, useContext, useEffect, useState} from 'react'
import {WithChildren} from '../../utils'

export interface PageLink {
  title: string
  path: string
  isActive: boolean
  isSeparator?: boolean
}
export interface SideMenu {
  position?: number
  title: string
  to:string
  icon?:string
  fontIcon?:string

}
export interface InnerNavigation {
  position?: number
  title: string
  to:string
  icon?:string
  fontIcon?:string

}

export interface PageDataContextModel {
  pageTitle?: string
  setPageTitle: (_title: string) => void
  pageDescription?: string
  setPageDescription: (_description: string) => void
  pageBreadcrumbs?: Array<PageLink>
  setPageBreadcrumbs: (_breadcrumbs: Array<PageLink>) => void
  pageSideMenu?: Array<SideMenu>
  setPageSideMenu: (_sideMenu: Array<SideMenu>) => void
  pageInnerNavigation?: Array<InnerNavigation>
  setPageInnerNavigation: (_innerNavigation: Array<InnerNavigation>) => void
}

const PageDataContext = createContext<PageDataContextModel>({
  setPageTitle: (_title: string) => {},
  setPageBreadcrumbs: (_breadcrumbs: Array<PageLink>) => {},
  setPageDescription: (_description: string) => {},
  setPageSideMenu: (_sideMenu: Array<SideMenu>) => {},
  setPageInnerNavigation: (_innerNavigation: Array<InnerNavigation>) => {},
})

const PageDataProvider: FC<WithChildren> = ({children}) => {
  const [pageTitle, setPageTitle] = useState<string>('')
  const [pageDescription, setPageDescription] = useState<string>('')
  const [pageBreadcrumbs, setPageBreadcrumbs] = useState<Array<PageLink>>([])
  const [pageSideMenu, setPageSideMenu] = useState<Array<SideMenu>>([])
  const [pageInnerNavigation, setPageInnerNavigation] = useState<Array<InnerNavigation>>([])
  const value: PageDataContextModel = {
    pageTitle,
    setPageTitle,
    pageDescription,
    setPageDescription,
    pageBreadcrumbs,
    setPageBreadcrumbs,
    pageSideMenu,
    setPageSideMenu,
    pageInnerNavigation,
    setPageInnerNavigation
  }
  return <PageDataContext.Provider value={value}>{children}</PageDataContext.Provider>
}

function usePageData() {
  return useContext(PageDataContext)
}

type Props = {
  description?: string
  breadcrumbs?: Array<PageLink>
  pageSideMenu?: Array<SideMenu>
  pageInnerNavigation?: Array<InnerNavigation>
}

const PageTitle: FC<Props & WithChildren> = ({children, description, breadcrumbs,pageSideMenu,pageInnerNavigation}) => {
  const {setPageTitle, setPageDescription, setPageBreadcrumbs,setPageSideMenu,setPageInnerNavigation} = usePageData()
  useEffect(() => {
    if (children) {
      setPageTitle(children.toString())
    }
    return () => {
      setPageTitle('')
    }
  }, [children])

  useEffect(() => {
    if (description) {
      setPageDescription(description)
    }
    return () => {
      setPageDescription('')
    }
  }, [description])

  useEffect(() => {
    if (breadcrumbs) {
      setPageBreadcrumbs(breadcrumbs)
    }
    return () => {
      setPageBreadcrumbs([])
    }
  }, [breadcrumbs])

  useEffect(() => {
    if (pageSideMenu) {
      setPageSideMenu(pageSideMenu)
    }
    return () => {
      setPageSideMenu([])
    }
  }, [breadcrumbs])
  useEffect(() => {
    if (pageInnerNavigation) {
      setPageInnerNavigation(pageInnerNavigation)
    }
    return () => {
      setPageInnerNavigation([])
    }
  }, [breadcrumbs])

  return <></>
}

const PageDescription: FC<WithChildren> = ({children}) => {
  const {setPageDescription} = usePageData()
  useEffect(() => {
    if (children) {
      setPageDescription(children.toString())
    }
    return () => {
      setPageDescription('')
    }
  }, [children])
  return <></>
}

export {PageDescription, PageTitle, PageDataProvider, usePageData}
