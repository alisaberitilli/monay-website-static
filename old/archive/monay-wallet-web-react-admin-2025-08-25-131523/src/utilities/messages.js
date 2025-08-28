import { getLocalStorageLanguage } from './common'
import enValidationMsg from './lang/validation-en'

const textMessages = {
  en: enValidationMsg
}

const lang = getLocalStorageLanguage()

export default textMessages[lang]
