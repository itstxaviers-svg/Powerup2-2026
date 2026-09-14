import { useEffect, useRef } from 'react'

type EnterActionEvent = Pick<KeyboardEvent, 'altKey' | 'ctrlKey' | 'isComposing' | 'key' | 'metaKey' | 'repeat' | 'shiftKey'>

export const isEnterActionKey = (event: EnterActionEvent) => (
  event.key === 'Enter'
  && !event.repeat
  && !event.isComposing
  && !event.altKey
  && !event.ctrlKey
  && !event.metaKey
  && !event.shiftKey
)

const enterActionStack: symbol[] = []

export function useEnterAction(onAction: () => void, enabled = true) {
  const actionRef = useRef(onAction)
  const actionIdRef = useRef(Symbol('enter-action'))
  actionRef.current = onAction

  useEffect(() => {
    if (!enabled) return

    const actionId = actionIdRef.current
    enterActionStack.push(actionId)

    const handleEnter = (event: KeyboardEvent) => {
      if (enterActionStack[enterActionStack.length - 1] !== actionId) return
      // Only the active shortcut button receives the same action natively.
      // Other focused answer buttons must not swallow the new Continue action.
      const targetIsEnterAction = event.target instanceof HTMLElement && Boolean(event.target.closest('[data-enter-action]'))
      if (!isEnterActionKey(event) || event.defaultPrevented || targetIsEnterAction) return
      event.preventDefault()
      actionRef.current()
    }

    window.addEventListener('keydown', handleEnter)
    return () => {
      window.removeEventListener('keydown', handleEnter)
      const actionIndex = enterActionStack.lastIndexOf(actionId)
      if (actionIndex >= 0) enterActionStack.splice(actionIndex, 1)
    }
  }, [enabled])
}
