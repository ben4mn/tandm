export default function PiPTimer({ elapsedSeconds, formatTime, onStop, processName }) {
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-indigo-600 to-indigo-800 flex flex-col items-center justify-center p-4">
      {processName && (
        <div className="text-indigo-200 text-sm mb-2 truncate max-w-full">
          {processName}
        </div>
      )}
      <div className="text-white text-4xl font-mono font-bold tracking-wider">
        {formatTime(elapsedSeconds)}
      </div>
      <button
        onClick={onStop}
        className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition shadow-lg"
      >
        Stop
      </button>
    </div>
  )
}
