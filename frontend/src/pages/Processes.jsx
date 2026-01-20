import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'
import ProcessList from '../components/ProcessList'
import ProcessForm from '../components/ProcessForm'

export default function Processes() {
  const api = useApi()
  const [processes, setProcesses] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProcesses()
  }, [])

  const loadProcesses = async () => {
    try {
      const result = await api.get('/processes')
      setProcesses(result.processes)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (data) => {
    try {
      await api.post('/processes', data)
      setShowForm(false)
      loadProcesses()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Processes</h1>
          <p className="text-gray-600">Manage your process definitions</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : 'New Process'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded">{error}</div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Create New Process
          </h2>
          <ProcessForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <ProcessList processes={processes} />
      </div>
    </div>
  )
}
