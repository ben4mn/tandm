import { useState, useCallback, useRef, useEffect } from 'react'

export function useDocumentPiP() {
  const [pipWindow, setPipWindow] = useState(null)
  const containerRef = useRef(null)

  const isSupported = typeof window !== 'undefined' && 'documentPictureInPicture' in window

  const openPiP = useCallback(async (options = {}) => {
    if (!isSupported) {
      console.warn('Document Picture-in-Picture is not supported')
      return null
    }

    try {
      const pip = await window.documentPictureInPicture.requestWindow({
        width: options.width || 300,
        height: options.height || 150,
      })

      // Copy stylesheets to PiP window
      const stylesheets = [...document.styleSheets]
      for (const sheet of stylesheets) {
        try {
          if (sheet.href) {
            const link = pip.document.createElement('link')
            link.rel = 'stylesheet'
            link.href = sheet.href
            pip.document.head.appendChild(link)
          } else if (sheet.cssRules) {
            const style = pip.document.createElement('style')
            const rules = [...sheet.cssRules].map(rule => rule.cssText).join('\n')
            style.textContent = rules
            pip.document.head.appendChild(style)
          }
        } catch (e) {
          // Skip cross-origin stylesheets
        }
      }

      // Create container for React portal
      const container = pip.document.createElement('div')
      container.id = 'pip-root'
      pip.document.body.appendChild(container)
      containerRef.current = container

      // Style the PiP body
      pip.document.body.style.margin = '0'
      pip.document.body.style.padding = '0'
      pip.document.body.style.overflow = 'hidden'

      setPipWindow(pip)

      // Handle close
      pip.addEventListener('pagehide', () => {
        setPipWindow(null)
        containerRef.current = null
      })

      return pip
    } catch (err) {
      console.error('Failed to open Picture-in-Picture:', err)
      return null
    }
  }, [isSupported])

  const closePiP = useCallback(() => {
    if (pipWindow) {
      pipWindow.close()
      setPipWindow(null)
      containerRef.current = null
    }
  }, [pipWindow])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pipWindow) {
        pipWindow.close()
      }
    }
  }, [pipWindow])

  return {
    isSupported,
    isOpen: !!pipWindow,
    pipWindow,
    pipContainer: containerRef.current,
    openPiP,
    closePiP,
  }
}
