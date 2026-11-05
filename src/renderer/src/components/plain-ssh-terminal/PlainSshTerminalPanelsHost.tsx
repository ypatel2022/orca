import { Suspense } from 'react'
import { lazyWithRetry } from '@/lib/lazy-with-retry'
import { removePlainSshPanel, usePlainSshPanels } from '@/ssh/plain-ssh-terminal-panels'
import { RecoverableRenderErrorBoundary } from '@/components/error-boundaries/RecoverableRenderErrorBoundary'
import { Button } from '@/components/ui/button'
import { translate } from '@/i18n/i18n'

const PlainSshTerminalPanels = lazyWithRetry(
  () =>
    import('./PlainSshTerminalPanels').then((module) => ({
      default: module.PlainSshTerminalPanels
    })),
  { reloadKey: 'plain-ssh-terminals' }
)

export function PlainSshTerminalPanelsHost(): React.JSX.Element | null {
  const panels = usePlainSshPanels()
  if (panels.length === 0) {
    return null
  }

  return (
    <Suspense fallback={null}>
      <RecoverableRenderErrorBoundary
        boundaryId="overlay.plain-ssh-terminals"
        surface="overlay"
        fallback={() => (
          <div
            role="alert"
            className="fixed right-4 bottom-4 z-50 flex w-[min(44rem,calc(100vw-2rem))] flex-col gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-floating"
          >
            <p className="text-sm">
              {translate(
                'auto.components.error.boundaries.RecoverableRenderErrorBoundary.ab855c11f4',
                'This part of Orca hit an error.'
              )}
            </p>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => panels.forEach(({ targetId }) => removePlainSshPanel(targetId))}
              >
                {translate('auto.components.ui.dialog.f26c4baeda', 'Close')}
              </Button>
            </div>
          </div>
        )}
      >
        <PlainSshTerminalPanels />
      </RecoverableRenderErrorBoundary>
    </Suspense>
  )
}
