import {FC} from 'react'
import {useLang} from './Basei18n'
import {IntlProvider} from 'react-intl'
import '@formatjs/intl-relativetimeformat/polyfill'
import '@formatjs/intl-relativetimeformat/locale-data/en'
import '@formatjs/intl-relativetimeformat/locale-data/fr'


import enMessages from './messages/en.json'
import frMessages from './messages/fr.json'
import { WithChildren } from '../utils'

const allMessages = {
  en: enMessages,
  fr: frMessages,
}

const I18nProvider: FC<WithChildren> = ({children}) => {
  const locale = useLang()
  const messages = allMessages[locale]

  return (
    <IntlProvider locale={locale} messages={messages}>
      {children}
    </IntlProvider>
  )
}

export {I18nProvider}
