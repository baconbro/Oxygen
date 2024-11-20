import { MenuItem } from './MenuItem'
import { useIntl } from 'react-intl'


export function MenuInner() {
  const intl = useIntl()

  return (
    <>
      <MenuItem title={intl.formatMessage({ id: 'MENU.DASHBOARD' })} to='/dashboard' />
      <MenuItem title={intl.formatMessage({ id: 'MENU.OKR' })} to='/goals' isNew={false} />
      <MenuItem title={intl.formatMessage({ id: 'MENU.WORKSPACE' })} to='/workspace' />
    </>
  )
}
