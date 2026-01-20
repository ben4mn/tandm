export default function InstanceList({ instances, onEdit }) {
  const formatDuration = (seconds) => {
    if (!seconds) return '--'
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`
    }
    return `${secs}s`
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString()
  }

  if (!instances || instances.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No instances recorded yet.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Process
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Started
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Duration
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {instances.map((instance) => (
            <tr key={instance.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-900">
                {instance.process_name}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {formatDate(instance.start_time)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                {formatDuration(instance.duration_seconds)}
              </td>
              <td className="px-4 py-3">
                {instance.end_time ? (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                    Completed
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">
                    In Progress
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => onEdit && onEdit(instance)}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
