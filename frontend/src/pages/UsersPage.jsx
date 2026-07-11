import { useState, useEffect } from 'react'
import { usersAPI } from '../api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { useAuth } from '../context/AuthContext'

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    try {
      const { data } = await usersAPI.getAll()
      setUsers(data.data)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const toggleStatus = async (id) => {
    try {
      const { data } = await usersAPI.toggleStatus(id)
      setUsers(us => us.map(u => u._id === id ? data.data : u))
      toast.success(data.message)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  const updateRole = async (id, role) => {
    try {
      const { data } = await usersAPI.updateRole(id, role)
      setUsers(us => us.map(u => u._id === id ? data.data : u))
      toast.success('Role updated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Users</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-0.5 text-sm">{users.length} registered users</p>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-800">
                {['User', 'Role', 'Status', 'Last Login', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-4"><div className="h-4 bg-surface-100 dark:bg-surface-800 rounded animate-pulse w-3/4" /></td>
                  ))}</tr>
                ))
              ) : users.map(u => (
                <tr key={u._id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
                        {u.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-surface-900 dark:text-white flex items-center gap-1.5">
                          {u.name}
                          {u._id === currentUser._id && (
                            <span className="text-xs bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 px-1.5 py-0.5 rounded-md font-medium">You</span>
                          )}
                        </p>
                        <p className="text-xs text-surface-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    {u._id === currentUser._id ? (
                      <span className="text-xs font-semibold text-surface-500 capitalize">{u.role}</span>
                    ) : (
                      <select
                        value={u.role}
                        onChange={e => updateRole(u._id, e.target.value)}
                        className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={u.isActive ? 'badge-active' : 'badge-inactive'}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-surface-500 dark:text-surface-400">
                    {u.lastLogin ? format(new Date(u.lastLogin), 'MMM d, HH:mm') : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-surface-500 dark:text-surface-400">
                    {format(new Date(u.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3.5">
                    {u._id !== currentUser._id && (
                      <button
                        onClick={() => toggleStatus(u._id)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                          u.isActive
                            ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                            : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
