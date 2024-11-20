import {FC} from 'react'
import clsx from 'clsx'
import {Link} from 'react-router-dom'
import {useLocation} from 'react-router'
import {checkIsActive, InlineSVG, WithChildren} from '../../../utils'
import {useLayout} from '../../core'

type Props = {
  to: string
  title: string
  icon?: string
  fontIcon?: string
  hasBullet?: boolean
  isNew?: boolean
}

const ToolbarMenuItem: FC<Props & WithChildren> = ({
  children,
  to,
  title,
  icon,
  fontIcon,
  isNew = false,
}) => {
  const {pathname} = useLocation()
  const isActive = checkIsActive(pathname, to)
  const {config} = useLayout()
  const {aside} = config

  return (

    <li className="nav-item">
      <Link className={clsx('nav-link text-active-primary ms-0 me-5 me-lg-8 pt-2 pb-3 pt-lg-4 pb-lg-5', {active: isActive})} to={to}>
        {icon && aside.menuIcon === 'svg' && (
          <span className='menu-icon me-2'>
            <InlineSVG path={icon} className='svg-icon-2' />
          </span>
        )}
        {fontIcon && aside.menuIcon === 'font' && <i className={clsx('bi fs-3 me-2', fontIcon)}></i>}
        <span>{title}</span>
        {isNew && <span className="badge badge-light">New</span>}
      </Link>
      {children}
      </li>
  )
}

export {ToolbarMenuItem}
