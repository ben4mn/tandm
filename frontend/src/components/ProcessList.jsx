import { Link } from 'react-router-dom'

export default function ProcessList({ processes, selectedId, onSelect }) {
  if (!processes || processes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No processes yet. Create one to get started!
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {onSelect && (
        <p className="text-sm text-gray-500 mb-3">
          Click a process to select it for tracking
        </p>
      )}
      {processes.map((process) => (
        <div
          key={process.id}
          onClick={() => onSelect && onSelect(process)}
          className={`p-4 rounded-lg border transition ${
            onSelect ? 'cursor-pointer' : ''
          } ${
            selectedId === process.id
              ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500 ring-opacity-50'
              : onSelect
                ? 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50'
                : 'border-gray-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">{process.name}</h3>
              {process.description && (
                <p className="text-sm text-gray-500 mt-1">{process.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {process.is_official && (
                <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded">
                  Official
                </span>
              )}
              <Link
                to={`/processes/${process.id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                View
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
