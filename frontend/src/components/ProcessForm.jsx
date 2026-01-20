import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function ProcessForm({ onSubmit, onCancel, initialData }) {
  const { user } = useAuth()
  const [name, setName] = useState(initialData?.name || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [isOfficial, setIsOfficial] = useState(initialData?.is_official || false)
  const [fields, setFields] = useState(
    initialData?.metadata_schema?.fields || []
  )

  const handleAddField = () => {
    setFields([
      ...fields,
      { name: '', type: 'text', required: false, options: [] },
    ])
  }

  const handleFieldChange = (index, key, value) => {
    const newFields = [...fields]
    newFields[index][key] = value
    setFields(newFields)
  }

  const handleRemoveField = (index) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      name,
      description,
      is_official: isOfficial,
      metadata_schema: { fields },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Process Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
        />
      </div>

      {user?.role === 'admin' && (
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isOfficial"
            checked={isOfficial}
            onChange={(e) => setIsOfficial(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="isOfficial" className="ml-2 text-sm text-gray-700">
            Mark as Official Process
          </label>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Custom Fields
          </label>
          <button
            type="button"
            onClick={handleAddField}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            + Add Field
          </button>
        </div>

        {fields.length === 0 && (
          <p className="text-sm text-gray-500 italic">
            No custom fields. Add fields to capture metadata for each instance.
          </p>
        )}

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={index}
              className="flex items-start space-x-2 p-3 bg-gray-50 rounded"
            >
              <input
                type="text"
                placeholder="Field name"
                value={field.name}
                onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                className="flex-1 rounded border-gray-300 px-2 py-1 text-sm border"
              />
              <select
                value={field.type}
                onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                className="rounded border-gray-300 px-2 py-1 text-sm border"
              >
                <option value="text">Text</option>
                <option value="textarea">Long Text</option>
                <option value="number">Number</option>
                <option value="select">Dropdown</option>
              </select>
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) =>
                    handleFieldChange(index, 'required', e.target.checked)
                  }
                  className="mr-1"
                />
                Required
              </label>
              <button
                type="button"
                onClick={() => handleRemoveField(index)}
                className="text-red-500 hover:text-red-700"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>

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
          {initialData ? 'Update' : 'Create'} Process
        </button>
      </div>
    </form>
  )
}
