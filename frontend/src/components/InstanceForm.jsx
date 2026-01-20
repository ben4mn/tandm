import { useState } from 'react'
import MetadataFields from './MetadataFields'

export default function InstanceForm({ instance, schema, onSubmit, onCancel }) {
  const [metadata, setMetadata] = useState(instance?.metadata || {})

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ metadata })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-2">Instance Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Started:</span>
            <span className="ml-2 text-gray-900">
              {new Date(instance.start_time).toLocaleString()}
            </span>
          </div>
          {instance.end_time && (
            <div>
              <span className="text-gray-500">Ended:</span>
              <span className="ml-2 text-gray-900">
                {new Date(instance.end_time).toLocaleString()}
              </span>
            </div>
          )}
          {instance.duration_seconds && (
            <div>
              <span className="text-gray-500">Duration:</span>
              <span className="ml-2 text-gray-900 font-mono">
                {Math.floor(instance.duration_seconds / 60)}m {instance.duration_seconds % 60}s
              </span>
            </div>
          )}
        </div>
      </div>

      {schema?.fields && schema.fields.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Metadata</h4>
          <MetadataFields schema={schema} values={metadata} onChange={setMetadata} />
        </div>
      )}

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Save Changes
        </button>
      </div>
    </form>
  )
}
