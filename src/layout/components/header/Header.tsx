import React, {FC} from 'react'
import {MenuInner} from './MenuInner'

const Header: FC = () => {
  return (
    <div
      className='header-menu align-items-stretch'
      data-xgn-drawer='true'
      data-xgn-drawer-name='header-menu'
      data-xgn-drawer-activate='{default: true, lg: false}'
      data-xgn-drawer-overlay='true'
      data-xgn-drawer-width="{default:'200px', '300px': '250px'}"
      data-xgn-drawer-direction='end'
      data-xgn-drawer-toggle='#xgn_header_menu_mobile_toggle'
      data-xgn-swapper='true'
      data-xgn-swapper-mode='prepend'
      data-xgn-swapper-parent="{default: '#xgn_body', lg: '#xgn_header_nav'}"
    >
      <div
        className='menu menu-lg-rounded menu-column menu-lg-row menu-state-bg menu-title-gray-700 menu-state-title-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-400 fw-bold my-5 my-lg-0 align-items-stretch'
        id='#xgn_header_menu'
        data-xgn-menu='true'
      >
        <MenuInner />
      </div>
    </div>
  )
}

export {Header}
