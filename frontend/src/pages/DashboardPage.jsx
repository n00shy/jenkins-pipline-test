import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { recordsAPI, activityAPI } from '../api'
import { format } from 'date-fns'

const StatCard = ({ label, value, icon, color, sub }) => (
  <div className="card animate-slide-up">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-surface-500 dark:text-surface-400">{label}</p>
        <p className="text-3xl font-bold text-surface-900 dark:text-white mt-1">{value}</p>
        {sub && <p className="text-xs text-surface-400 mt-1">{sub}</p>}
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
    </div>
  </div>
)

const actionColors = {
  CREATE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  UPDATE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  LOGIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  LOGOUT: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400',
  EXPORT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, pending: 0 })
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recRes, actRes] = await Promise.all([
          recordsAPI.getAll({ limit: 1 }),
          activityAPI.getAll({ limit: 8 })
        ])
        const statArr = recRes.data.data.stats
        const m = {}
        statArr.forEach(s => m[s._id] = s.count)
        const total = statArr.reduce((s, i) => s + i.count, 0)
        setStats({ total, active: m.active || 0, inactive: m.inactive || 0, pending: m.pending || 0 })
        setActivities(actRes.data.data.activities)
      } catch {} finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Dashboard</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">Here's what's happening today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Records"
          value={stats.total}
          sub="All time"
          color="bg-primary-100 dark:bg-primary-900/30"
          icon={<svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        />
        <StatCard
          label="Active"
          value={stats.active}
          sub={`${stats.total ? Math.round(stats.active / stats.total * 100) : 0}% of total`}
          color="bg-emerald-100 dark:bg-emerald-900/30"
          icon={<svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          color="bg-amber-100 dark:bg-amber-900/30"
          icon={<svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Inactive"
          value={stats.inactive}
          color="bg-red-100 dark:bg-red-900/30"
          icon={<svg className="w-6 h-6 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-4">Recent Activity</h2>
        {activities.length === 0 ? (
          <p className="text-surface-400 text-sm py-8 text-center">No activity yet.</p>
        ) : (
          <div className="space-y-3">
            {activities.map(a => (
              <div key={a._id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-bold flex-shrink-0 ${actionColors[a.action]}`}>
                  {a.action}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-surface-700 dark:text-surface-300 truncate">{a.details}</p>
                  <p className="text-xs text-surface-400 mt-0.5">{a.userName}</p>
                </div>
                <span className="text-xs text-surface-400 flex-shrink-0">
                  {format(new Date(a.createdAt), 'MMM d, HH:mm')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
