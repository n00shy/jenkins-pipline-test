import { useState, useEffect } from 'react'
import { activityAPI } from '../api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const actionConfig = {
  CREATE: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: '✚' },
  UPDATE: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: '✎' },
  DELETE: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: '✕' },
  LOGIN:  { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: '→' },
  LOGOUT: { color: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400', icon: '←' },
  EXPORT: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: '↓' },
}

export default function ActivityPage() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, limit: 20 })

  const fetch = async (p = 1) => {
    setLoading(true)
    try {
      const { data } = await activityAPI.getAll({ page: p, limit: 20 })
      setActivities(data.data.activities)
      setPagination(data.data.pagination)
    } catch {
      toast.error('Failed to load activity')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch(page) }, [page])

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Activity Log</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-0.5 text-sm">{pagination.total} total events</p>
      </div>

      <div className="card">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-16 h-6 bg-surface-100 dark:bg-surface-800 rounded-lg animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-100 dark:bg-surface-800 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-surface-100 dark:bg-surface-800 rounded animate-pulse w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-16 text-surface-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <p className="font-medium">No activity yet</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-100 dark:divide-surface-800">
            {activities.map(a => {
              const cfg = actionConfig[a.action] || actionConfig.CREATE
              return (
                <div key={a._id} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0 hover:bg-surface-50 dark:hover:bg-surface-800/30 -mx-6 px-6 transition-colors">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold flex-shrink-0 ${cfg.color}`}>
                    <span>{cfg.icon}</span>
                    {a.action}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-800 dark:text-surface-200">{a.details}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-surface-400">
                      <span>{a.userName}</span>
                      <span>·</span>
                      <span>{a.resource}</span>
                      {a.ip && <><span>·</span><span className="font-mono">{a.ip}</span></>}
                    </div>
                  </div>
                  <span className="text-xs text-surface-400 whitespace-nowrap flex-shrink-0">
                    {format(new Date(a.createdAt), 'MMM d, HH:mm')}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.total > pagination.limit && (
          <div className="flex justify-center gap-2 mt-6 pt-4 border-t border-surface-200 dark:border-surface-800">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              className="px-4 py-2 rounded-xl text-sm font-medium btn-secondary disabled:opacity-40">← Prev</button>
            <button onClick={() => setPage(p => p + 1)} disabled={page * pagination.limit >= pagination.total}
              className="px-4 py-2 rounded-xl text-sm font-medium btn-secondary disabled:opacity-40">Next →</button>
          </div>
        )}
      </div>
    </div>
  )
}
