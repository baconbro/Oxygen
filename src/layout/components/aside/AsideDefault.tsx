import { FC, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { useLayout } from '../../core'
import { InlineSVG, toAbsoluteUrl } from '../../../utils'
import { AsideMenu } from './AsideMenu'
import FeedbackForm from '../../../components/common/Feedbackform'

const AsideDefault: FC = () => {
  const { config, classes } = useLayout()
  const asideRef = useRef<HTMLDivElement | null>(null)
  const { aside } = config
  const [minimized, setMinimized] = useState(aside.minimized)



  const minimize = () => {
    asideRef.current?.classList.add('animating')
    setTimeout(() => {
      asideRef.current?.classList.remove('animating')
    }, 300)
    setMinimized((prevValue) => !prevValue);
  }

  return (
    <div
      id='xgn_aside'
      className={clsx('aside', classes.aside.join(' '))}
      data-xgn-drawer='true'
      data-xgn-drawer-name='aside'
      data-xgn-drawer-activate='{default: true, lg: false}'
      data-xgn-drawer-overlay='true'
      data-xgn-drawer-width="{default:'200px', '300px': '250px'}"
      data-xgn-drawer-direction='start'
      data-xgn-drawer-toggle='#xgn_aside_mobile_toggle'
      ref={asideRef}
    >

      <div className='aside-logo flex-column-auto' id='xgn_aside_logo'>


        <Link to='/dashboard'>
          <img
            alt='Logo'
            className='h-25px app-sidebar-logo-default'
            src={toAbsoluteUrl('/media/logos/default-dark.svg')}
          />
          {minimized ? ('') : (
            <>
              <span className='me-2'> Oxygen</span>
              <span className="badge badge-light-primary me-auto">Beta</span>
            </>
          )
          }
        </Link>

        {aside.minimize && (
          <div
            id='xgn_aside_toggle'
            className='btn btn-icon w-auto px-0 btn-active-color-primary aside-toggle'
            data-xgn-toggle='true'
            data-xgn-toggle-state='active'
            data-xgn-toggle-target='body'
            data-xgn-toggle-name='aside-minimize'
            onClick={minimize}
          >
            <InlineSVG
              path={'/media/icons/duotune/arrows/arr080.svg'}
              className={'svg-icon-1 rotate-180'}
            />
          </div>
        )}
      </div>
      <div className='aside-menu flex-column-fluid'>
        <AsideMenu asideMenuCSSClasses={classes.asideMenu} />
      </div>
      <div className='aside-footer flex-column-auto pt-5 pb-7 px-5' id='xgn_aside_footer'>
        <FeedbackForm />
      </div>
    </div>
  )
}

export { AsideDefault }
