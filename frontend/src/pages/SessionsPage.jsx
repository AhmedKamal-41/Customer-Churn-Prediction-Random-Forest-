import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChatApp } from '../chat/ChatAppContext'
import {
  listSessions,
  deleteSession,
  renameSession,
  exportSessionJson,
} from '../storage/sessions'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import Input from '../ui/Input'

function formatUpdated(updatedAt) {
  try {
    return new Date(updatedAt).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

export default function SessionsPage() {
  const navigate = useNavigate()
  const { setActiveSessionId } = useChatApp()
  const [sessions, setSessions] = useState([])
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')

  const refresh = () => setSessions(listSessions())
  useEffect(() => refresh(), [])

  const filtered = sessions.filter((s) =>
    (s.title || '').toLowerCase().includes(search.toLowerCase().trim())
  )

  const handleOpen = (id) => {
    setActiveSessionId(id)
    navigate('/chat')
  }

  const handleExport = (id) => {
    const json = exportSessionJson(id)
    if (!json) return
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `session-${id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDelete = (id) => {
    if (!window.confirm('Delete this session? This cannot be undone.')) return
    deleteSession(id)
    refresh()
  }

  const startEdit = (session) => {
    setEditingId(session.id)
    setEditTitle(session.title || '')
  }

  const saveEdit = () => {
    if (editingId == null) return
    renameSession(editingId, editTitle.trim() || 'Untitled')
    setEditingId(null)
    setEditTitle('')
    refresh()
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
  }

  return (
    <div className="max-w-4xl w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text">Sessions</h1>
        <p className="text-sm text-muted mt-1">
          Manage your saved chat sessions. Open, rename, export, or delete.
        </p>
      </div>

      <Card title="Sessions">
        <div className="mb-4">
          <Input
            type="search"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search sessions"
            className="max-w-xs"
          />
        </div>
        {filtered.length === 0 ? (
          <p className="text-sm text-muted">No sessions found.</p>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 font-semibold text-text">Title</th>
                  <th className="text-left py-2 px-2 font-semibold text-text">Updated</th>
                  <th className="text-left py-2 px-2 font-semibold text-text">Status</th>
                  <th className="text-left py-2 px-2 font-semibold text-text">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((session) => (
                  <tr key={session.id} className="border-b border-border/50 hover:bg-card/50">
                    <td className="py-2 px-2">
                      {editingId === session.id ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit()
                            if (e.key === 'Escape') cancelEdit()
                          }}
                          className="w-full rounded-xl border border-border bg-card px-2 py-1.5 text-text text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                          autoFocus
                          aria-label="Edit title"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEdit(session)}
                          className="text-left text-text hover:text-accent truncate max-w-[200px] block"
                          title={session.title || 'Untitled'}
                        >
                          {session.title || 'Untitled'}
                        </button>
                      )}
                    </td>
                    <td className="py-2 px-2 text-muted">{formatUpdated(session.updatedAt)}</td>
                    <td className="py-2 px-2">
                      <Badge status={session.status === 'done' ? 'success' : 'neutral'}>
                        {session.status || 'collecting'}
                      </Badge>
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="ghost" type="button" onClick={() => handleOpen(session.id)} className="text-xs py-1.5">
                          Open
                        </Button>
                        <Button variant="ghost" type="button" onClick={() => handleExport(session.id)} className="text-xs py-1.5">
                          Export JSON
                        </Button>
                        <Button variant="ghost" type="button" onClick={() => handleDelete(session.id)} className="text-xs py-1.5 text-red-400 hover:text-red-300">
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}