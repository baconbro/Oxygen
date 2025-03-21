import { FC } from 'react'
import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router'
import { checkIsActive, InlineSVG, WithChildren } from '../../../utils'
import { useLayout } from '../../core'

type Props = {
  to: string
  title: string
  icon?: string
  fontIcon?: string
  hasBullet?: boolean
  isNew?: boolean
  preserveFilters?: boolean
}

const AsideMenuItem: FC<Props & WithChildren> = ({
  children,
  to,
  title,
  icon,
  fontIcon,
  hasBullet = false,
  isNew = false,
  preserveFilters = true,
}) => {
  const { pathname, search } = useLocation()
  const isActive = checkIsActive(pathname, to)
  const { config } = useLayout()
  const { aside } = config

  // Preserve query parameters when navigating
  const getDestination = () => {
    if (!preserveFilters) return to
    
    // Don't transfer query params if going to a specific filter URL
    if (to.includes('?')) return to
    
    // Extract filter-related parameters only
    const searchParams = new URLSearchParams(search)
    const filterParams = new URLSearchParams()
    
    // Copy only filter-related parameters
    const filterKeys = ['search', 'users', 'recent', 'myOnly', 'types', 'status', 'hideOld', 'sprint', 'wpkg']
    filterKeys.forEach(key => {
      if (searchParams.has(key)) {
        filterParams.set(key, searchParams.get(key)!)
      }
    })
    
    const newParams = filterParams.toString()
    return newParams ? `${to}?${newParams}` : to
  }

  return (
    <>
      <div className='menu-item'>
      <Link className={clsx('menu-link without-sub', {active: isActive})} to={getDestination()}>
        {hasBullet && (
          <span className='menu-bullet'>
            <span className='bullet bullet-dot'></span>
          </span>
        )}
        {icon && (
          <span className='menu-icon'>
            <i className={`rounded fs-2 bi ${icon || 'bi-clock-history'}`} />
          </span>
        )}
        {fontIcon && <i className={clsx('bi fs-3', fontIcon)}></i>}
        <span className='menu-title'>{title}</span>
      </Link>
      {children}
    </div>
    </>
  )
}

export { AsideMenuItem }
