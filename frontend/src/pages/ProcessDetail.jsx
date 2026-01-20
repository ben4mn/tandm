import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../hooks/useAuth'
import ProcessForm from '../components/ProcessForm'
import InstanceList from '../components/InstanceList'
import InstanceForm from '../components/InstanceForm'

export default function ProcessDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const api = useApi()
  const { user } = useAuth()
  const [process, setProcess] = useState(null)
  const [instances, setInstances] = useState([])
  const [editing, setEditing] = useState(false)
  const [editingInstance, setEditingInstance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      const [processRes, instanceRes] = await Promise.all([
        api.get(`/processes/${id}`),
        api.get(`/instances?process_id=${id}`),
      ])
      setProcess(processRes.process)
      setInstances(instanceRes.instances)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (data) => {
    try {
      await api.put(`/processes/${id}`, data)
      setEditing(false)
      loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this process?')) return

    try {
      await api.del(`/processes/${id}`)
      navigate('/processes')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleInstanceUpdate = async (data) => {
    try {
      await api.put(`/instances/${editingInstance.id}`, data)
      setEditingInstance(null)
      loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  const canEdit = process?.created_by === user?.id ||
    (process?.is_official && user?.role === 'admin')

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>
  }

  if (!process) {
    return <div className="text-center py-8 text-red-500">Process not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{process.name}</h1>
          {process.description && (
            <p className="text-gray-600 mt-1">{process.description}</p>
          )}
          <div className="flex items-center space-x-2 mt-2">
            {process.is_official && (
              <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded">
                Official
              </span>
            )}
            <span className="text-sm text-gray-500">
              Created by {process.creator_name || 'Unknown'}
            </span>
          </div>
        </div>
        {canEdit && (
          <div className="space-x-2">
            <button
              onClick={() => setEditing(!editing)}
              className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded"
            >
              {editing ? 'Cancel' : 'Edit'}
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded">{error}</div>
      )}

      {editing && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Edit Process</h2>
          <ProcessForm
            initialData={process}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(false)}
          />
        </div>
      )}

      {process.metadata_schema?.fields?.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-medium text-gray-900 mb-3">Custom Fields</h3>
          <div className="space-y-2">
            {process.metadata_schema.fields.map((field, i) => (
              <div key={i} className="flex items-center text-sm">
                <span className="font-medium text-gray-700">{field.name}</span>
                <span className="mx-2 text-gray-400">-</span>
                <span className="text-gray-500">{field.type}</span>
                {field.required && (
                  <span className="ml-2 text-xs text-red-500">Required</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="font-medium text-gray-900">Instances</h3>
        </div>
        <InstanceList
          instances={instances}
          onEdit={setEditingInstance}
        />
      </div>

      {editingInstance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Edit Instance
            </h2>
            <InstanceForm
              instance={editingInstance}
              schema={process.metadata_schema}
              onSubmit={handleInstanceUpdate}
              onCancel={() => setEditingInstance(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
