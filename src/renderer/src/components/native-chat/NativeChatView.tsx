import { Suspense } from 'react'
import { lazyWithRetry } from '@/lib/lazy-with-retry'
import { RecoverableRenderErrorBoundary } from '@/components/error-boundaries/RecoverableRenderErrorBoundary'
import { NativeChatSessionGate } from './NativeChatSessionGate'
import { useNativeChatStatusEntry } from './use-native-chat-status-entry'
import type { NativeChatViewProps } from './native-chat-view-types'
import { NativeChatPaneFileDropSurface } from './NativeChatPaneFileDropSurface'
import { NativeChatVisualOwnerProvider } from './native-chat-visual-owner'
import { NativeChatFileLinkExistenceProvider } from './use-native-chat-file-link-existence'
import { NativeChatMarkdownImageOwnerProvider } from './native-chat-markdown-image-owner'
import { NativeChatLoadingCue } from './NativeChatLoadingCue'
import { NativeChatEmptyState } from './NativeChatEmptyState'

const NativeChatStructuredSession = lazyWithRetry(
  () =>
    import('./NativeChatStructuredSession').then((module) => ({
      default: module.NativeChatStructuredSession
    })),
  { reloadKey: 'native-chat-structured-session' }
)
const NativeChatResolvedView = lazyWithRetry(
  () =>
    import('./NativeChatResolvedView').then((module) => ({
      default: module.NativeChatResolvedView
    })),
  { reloadKey: 'native-chat-resolved-view' }
)

export type { NativeChatViewProps } from './native-chat-view-types'

export default function NativeChatView(props: NativeChatViewProps): React.JSX.Element {
  return (
    <NativeChatPaneFileDropSurface className="relative flex h-full min-h-0 min-w-0 w-full">
      {props.mode === 'structured' ? (
        <NativeChatVisualOwnerProvider
          key={props.sessionId}
          target={props.target}
          sessionId={props.sessionId}
          tabId={props.tabId}
        >
          <NativeChatFileLinkExistenceProvider tabId={props.tabId}>
            <NativeChatMarkdownImageOwnerProvider
              tabId={props.tabId}
              isVisible={props.isVisible}
              sessionId={props.sessionId}
            >
              <RecoverableRenderErrorBoundary
                boundaryId="native-chat.structured-session"
                surface="terminal-workbench"
                resetKey={props.sessionId}
                fallback={() => <NativeChatEmptyState kind="error" retrying />}
              >
                <Suspense fallback={<NativeChatLoadingCue />}>
                  <NativeChatStructuredSession {...props} />
                </Suspense>
              </RecoverableRenderErrorBoundary>
            </NativeChatMarkdownImageOwnerProvider>
          </NativeChatFileLinkExistenceProvider>
        </NativeChatVisualOwnerProvider>
      ) : (
        <NativeChatBridgeView {...props} />
      )}
    </NativeChatPaneFileDropSurface>
  )
}

function NativeChatBridgeView({
  terminalTabId,
  isVisible,
  isFocusedGroup,
  paneKey: preferredPaneKey,
  targetPtyId = null,
  launchAgent,
  resolvedAgent,
  ownsTabWideLaunchDraft,
  onSwitchToTerminal,
  readTerminalScreen,
  readTerminalDraft,
  contextMenuActions
}: Exclude<NativeChatViewProps, { mode: 'structured' }>): React.JSX.Element {
  const { entry: agentStatusEntry, paneKey } = useNativeChatStatusEntry(
    terminalTabId,
    preferredPaneKey
  )
  return (
    <NativeChatSessionGate
      paneKey={paneKey}
      launchAgent={launchAgent}
      resolvedAgent={resolvedAgent}
      agentStatusEntry={agentStatusEntry}
      ptyId={targetPtyId}
    >
      {(resolution) => (
        <NativeChatFileLinkExistenceProvider tabId={terminalTabId}>
          <NativeChatMarkdownImageOwnerProvider
            sessionId={resolution.sessionId}
            tabId={terminalTabId}
            isVisible={isVisible}
          >
            <RecoverableRenderErrorBoundary
              boundaryId="native-chat.resolved-view"
              surface="terminal-workbench"
              resetKey={resolution.sessionId ?? resolution.paneKey}
              fallback={() => <NativeChatEmptyState kind="error" retrying />}
            >
              <Suspense fallback={<NativeChatLoadingCue />}>
                <NativeChatResolvedView
                  paneKey={resolution.paneKey}
                  agent={resolution.agent}
                  sessionId={resolution.sessionId}
                  transcriptPath={resolution.transcriptPath}
                  isVisible={isVisible}
                  isFocusedGroup={isFocusedGroup}
                  targetPtyId={targetPtyId}
                  terminalTabId={terminalTabId}
                  ownsTabWideLaunchDraft={ownsTabWideLaunchDraft}
                  onSwitchToTerminal={onSwitchToTerminal}
                  readTerminalScreen={readTerminalScreen}
                  readTerminalDraft={readTerminalDraft}
                  contextMenuActions={contextMenuActions}
                />
              </Suspense>
            </RecoverableRenderErrorBoundary>
          </NativeChatMarkdownImageOwnerProvider>
        </NativeChatFileLinkExistenceProvider>
      )}
    </NativeChatSessionGate>
  )
}
