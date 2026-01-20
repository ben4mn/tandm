import { useAuth } from './useAuth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export function useApi() {
  const { token } = useAuth()

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }

  const get = async (path) => {
    const res = await fetch(`${API_URL}${path}`, { headers })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Request failed')
    return data
  }

  const post = async (path, body) => {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Request failed')
    return data
  }

  const put = async (path, body) => {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Request failed')
    return data
  }

  const del = async (path) => {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'DELETE',
      headers,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Request failed')
    return data
  }

  return { get, post, put, del }
}
