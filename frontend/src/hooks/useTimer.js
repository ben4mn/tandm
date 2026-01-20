import { useState, useRef, useCallback } from 'react'

export function useTimer() {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const intervalRef = useRef(null)

  const start = useCallback(() => {
    if (isRunning) return

    const now = new Date()
    setStartTime(now)
    setIsRunning(true)
    setElapsedSeconds(0)

    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)

    return now
  }, [isRunning])

  const stop = useCallback(() => {
    if (!isRunning) return null

    clearInterval(intervalRef.current)
    setIsRunning(false)

    const endTime = new Date()
    const result = {
      startTime,
      endTime,
      duration: elapsedSeconds,
    }

    return result
  }, [isRunning, startTime, elapsedSeconds])

  const reset = useCallback(() => {
    clearInterval(intervalRef.current)
    setIsRunning(false)
    setElapsedSeconds(0)
    setStartTime(null)
  }, [])

  const formatTime = useCallback((seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  return {
    isRunning,
    elapsedSeconds,
    startTime,
    start,
    stop,
    reset,
    formatTime,
  }
}
