import { translate } from '@/i18n/i18n'

export function nativeChatImageNumberLabel(number: number): string {
  return translate('components.native-chat.composer.imageNumber', 'Image #{{number}}', { number })
}
