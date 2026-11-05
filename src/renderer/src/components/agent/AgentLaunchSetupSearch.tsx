import { useLayoutEffect, useRef } from 'react'
import { CommandInput } from '@/components/ui/command'
import { translate } from '@/i18n/i18n'

export function AgentLaunchSetupSearch({
  agentLabel,
  query,
  disabled,
  pending,
  onQueryChange,
  shouldAutoFocus
}: {
  agentLabel: string
  query: string
  disabled?: boolean
  pending: boolean
  onQueryChange: (query: string) => void
  shouldAutoFocus?: () => boolean
}): React.JSX.Element {
  const search = useRef<HTMLInputElement>(null)
  const focusOnMount = useRef(shouldAutoFocus)
  useLayoutEffect(() => {
    if (focusOnMount.current?.()) {
      search.current?.focus({ preventScroll: true })
    }
  }, [])
  return (
    <CommandInput
      ref={search}
      autoFocus={shouldAutoFocus === undefined}
      disabled={disabled}
      aria-busy={pending}
      value={query}
      onValueChange={onQueryChange}
      aria-label={translate('agentPicker.searchModels', 'Search models')}
      placeholder={translate('agentPicker.searchAgentModels', 'Search {{agent}} models…', {
        agent: agentLabel
      })}
    />
  )
}
