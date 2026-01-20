import { useTimer } from '../hooks/useTimer'

export default function Timer({ onStart, onStop, disabled }) {
  const { isRunning, elapsedSeconds, start, stop, formatTime } = useTimer()

  const handleStart = () => {
    const startTime = start()
    if (onStart) onStart(startTime)
  }

  const handleStop = () => {
    const result = stop()
    if (onStop && result) onStop(result)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-center">
        <div className="text-5xl font-mono font-bold text-gray-800 mb-6">
          {formatTime(elapsedSeconds)}
        </div>
        <div className="flex justify-center space-x-4">
          {!isRunning ? (
            <button
              onClick={handleStart}
              disabled={disabled}
              className="px-8 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Start
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="px-8 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
            >
              Stop
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
