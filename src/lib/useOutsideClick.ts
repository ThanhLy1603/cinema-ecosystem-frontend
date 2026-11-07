import { useEffect, type RefObject } from 'react'

export function useOutsideClick(containerRef: RefObject<HTMLElement | null>, onDismiss: () => void): void {
   function subscribeToDismissEvents(): () => void {
      function handleMouseDown(mouseEvent: MouseEvent): void {
         const container: HTMLElement | null = containerRef.current
         if (container && !container.contains(mouseEvent.target as Node)) {
            onDismiss()
         }
      }

      function handleKeyDown(keyboardEvent: KeyboardEvent): void {
         if (keyboardEvent.key === 'Escape') {
            onDismiss()
         }
      }

      document.addEventListener('mousedown', handleMouseDown)
      document.addEventListener('keydown', handleKeyDown)
      return (): void => {
         document.removeEventListener('mousedown', handleMouseDown)
         document.removeEventListener('keydown', handleKeyDown)
      }
   }

   useEffect(subscribeToDismissEvents, [containerRef, onDismiss])
}
