export default function Timer({
  isRunning,
  elapsedSeconds,
  formatTime,
  onStart,
  onStop,
  onPopOut,
  isPiPSupported,
  isPiPOpen,
  disabled,
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-center">
        <div className="text-5xl font-mono font-bold text-gray-800 mb-6">
          {formatTime(elapsedSeconds)}
        </div>
        <div className="flex justify-center items-center space-x-4">
          {!isRunning ? (
            <button
              onClick={onStart}
              disabled={disabled}
              className="px-8 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Start
            </button>
          ) : (
            <>
              <button
                onClick={onStop}
                className="px-8 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
              >
                Stop
              </button>
              {isPiPSupported && !isPiPOpen && (
                <button
                  onClick={onPopOut}
                  className="px-4 py-3 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-600 transition flex items-center space-x-2"
                  title="Pop out timer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M3 4a1 1 0 011-1h4a1 1 0 010 2H5v10h10v-3a1 1 0 112 0v3a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2z" />
                    <path d="M15 3a1 1 0 00-1 1v2.586l-4.293 4.293a1 1 0 001.414 1.414L15 8.414V11a1 1 0 102 0V4a1 1 0 00-1-1h-1z" />
                  </svg>
                  <span>Pop Out</span>
                </button>
              )}
              {isPiPOpen && (
                <span className="text-sm text-indigo-600 font-medium">
                  Timer in pop-out window
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
