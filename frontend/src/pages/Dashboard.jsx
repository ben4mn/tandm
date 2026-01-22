import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useApi } from '../hooks/useApi'
import { useTimer } from '../hooks/useTimer'
import { useDocumentPiP } from '../hooks/useDocumentPiP'
import Timer from '../components/Timer'
import PiPTimer from '../components/PiPTimer'
import ProcessList from '../components/ProcessList'
import InstanceList from '../components/InstanceList'
import MetadataFields from '../components/MetadataFields'

export default function Dashboard() {
  const api = useApi()
  const timer = useTimer()
  const pip = useDocumentPiP()

  const [processes, setProcesses] = useState([])
  const [instances, setInstances] = useState([])
  const [selectedProcess, setSelectedProcess] = useState(null)
  const [activeInstance, setActiveInstance] = useState(null)
  const [metadata, setMetadata] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  // Close PiP when timer stops
  useEffect(() => {
    if (!timer.isRunning && pip.isOpen) {
      pip.closePiP()
    }
  }, [timer.isRunning, pip.isOpen])

  const loadData = async () => {
    try {
      const [processRes, instanceRes] = await Promise.all([
        api.get('/processes'),
        api.get('/instances?limit=10'),
      ])
      setProcesses(processRes.processes)
      setInstances(instanceRes.instances)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStart = async () => {
    if (!selectedProcess) return

    const startTime = timer.start()

    try {
      const result = await api.post('/instances', {
        process_id: selectedProcess.id,
        start_time: startTime.toISOString(),
      })
      setActiveInstance(result.instance)
    } catch (err) {
      setError(err.message)
      timer.reset()
    }
  }

  const handleStop = async () => {
    if (!activeInstance) return

    const result = timer.stop()
    if (!result) return

    try {
      await api.put(`/instances/${activeInstance.id}`, {
        end_time: result.endTime.toISOString(),
        metadata,
      })
      setActiveInstance(null)
      setMetadata({})
      loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  const handlePopOut = async () => {
    await pip.openPiP({ width: 300, height: 150 })
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Track your process instances</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Timer
            isRunning={timer.isRunning}
            elapsedSeconds={timer.elapsedSeconds}
            formatTime={timer.formatTime}
            onStart={handleStart}
            onStop={handleStop}
            onPopOut={handlePopOut}
            isPiPSupported={pip.isSupported}
            isPiPOpen={pip.isOpen}
            disabled={!selectedProcess}
          />

          {!selectedProcess && !activeInstance && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
              <p className="font-medium">Select a process to start tracking time</p>
              <p className="text-sm mt-1">
                Choose a process from the list on the right, or{' '}
                <a href="/processes" className="text-indigo-600 hover:text-indigo-800 underline">
                  create a new process
                </a>{' '}
                if you don't see one that fits.
              </p>
            </div>
          )}

          {activeInstance && selectedProcess?.metadata_schema?.fields?.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-medium text-gray-900 mb-4">Add Metadata</h3>
              <MetadataFields
                schema={selectedProcess.metadata_schema}
                values={metadata}
                onChange={setMetadata}
              />
            </div>
          )}

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="font-medium text-gray-900">Recent Activity</h3>
            </div>
            <InstanceList instances={instances} />
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-medium text-gray-900 mb-4">Select Process</h3>
            <ProcessList
              processes={processes}
              selectedId={selectedProcess?.id}
              onSelect={setSelectedProcess}
            />
          </div>
        </div>
      </div>

      {/* Render PiP Timer in the pop-out window */}
      {pip.isOpen && pip.pipContainer && createPortal(
        <PiPTimer
          elapsedSeconds={timer.elapsedSeconds}
          formatTime={timer.formatTime}
          onStop={handleStop}
          processName={selectedProcess?.name}
        />,
        pip.pipContainer
      )}
    </div>
  )
}
