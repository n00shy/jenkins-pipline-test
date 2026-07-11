import { useState, useEffect, useCallback } from 'react'
import { recordsAPI } from '../api'
import toast from 'react-hot-toast'
import RecordModal from '../components/records/RecordModal'
import DeleteModal from '../components/records/DeleteModal'
import { format } from 'date-fns'

const StatusBadge = ({ status }) => {
  const map = {
    active: 'badge-active',
    inactive: 'badge-inactive',
    pending: 'badge-pending'
  }
  return (
    <span className={map[status]}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export default function RecordsPage() {
  const [records, setRecords] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [modal, setModal] = useState(null) // null | 'create' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null)

  const fetchRecords = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = { page, limit: pagination.limit, search, status, startDate, endDate, sortBy, sortOrder }
      const { data } = await recordsAPI.getAll(params)
      setRecords(data.data.records)
      setPagination(data.data.pagination)
    } catch {
      toast.error('Failed to load records')
    } finally {
      setLoading(false)
    }
  }, [search, status, startDate, endDate, sortBy, sortOrder, pagination.limit])

  useEffect(() => {
    const t = setTimeout(() => fetchRecords(1), 400)
    return () => clearTimeout(t)
  }, [search, status, startDate, endDate, sortBy, sortOrder])

  const handleSave = async (form) => {
    try {
      if (modal === 'edit') {
        await recordsAPI.update(selected._id, form)
        toast.success('Record updated!')
      } else {
        await recordsAPI.create(form)
        toast.success('Record created!')
      }
      setModal(null)
      fetchRecords(pagination.page)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    }
  }

  const handleDelete = async () => {
    try {
      await recordsAPI.delete(selected._id)
      toast.success('Record deleted!')
      setModal(null)
      fetchRecords(pagination.page)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  const handleExport = async () => {
    try {
      const { data } = await recordsAPI.export()
      const records = data.data
      const headers = ['Full Name', 'Email', 'Phone', 'Address', 'Status', 'Created At']
      const rows = records.map(r => [
        r.fullName, r.email, r.phone, r.address, r.status,
        format(new Date(r.createdAt), 'yyyy-MM-dd HH:mm')
      ])
      const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url
      a.download = `records-${format(new Date(), 'yyyy-MM-dd')}.csv`
      a.click(); URL.revokeObjectURL(url)
      toast.success(`Exported ${records.length} records`)
    } catch {
      toast.error('Export failed')
    }
  }

  const toggleSort = (field) => {
    if (sortBy === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc')
    else { setSortBy(field); setSortOrder('asc') }
  }

  const SortIcon = ({ field }) => (
    <svg className={`w-4 h-4 ml-1 transition-transform ${sortBy === field && sortOrder === 'desc' ? 'rotate-180' : ''} ${sortBy !== field ? 'text-surface-300 dark:text-surface-600' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  )

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Records</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-0.5 text-sm">{pagination.total} total records</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export CSV
          </button>
          <button onClick={() => { setSelected(null); setModal('create') }} className="btn-primary flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add Record
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative lg:col-span-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            <input
              className="input-field pl-9 py-2.5 text-sm"
              placeholder="Search records..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="input-field py-2.5 text-sm" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
          <input type="date" className="input-field py-2.5 text-sm" value={startDate} onChange={e => setStartDate(e.target.value)} placeholder="Start Date" />
          <input type="date" className="input-field py-2.5 text-sm" value={endDate} onChange={e => setEndDate(e.target.value)} placeholder="End Date" />
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-800">
                {[
                  { label: 'Name', field: 'fullName' },
                  { label: 'Email', field: 'email' },
                  { label: 'Phone', field: null },
                  { label: 'Address', field: null },
                  { label: 'Status', field: 'status' },
                  { label: 'Created', field: 'createdAt' },
                  { label: 'Actions', field: null }
                ].map(col => (
                  <th
                    key={col.label}
                    className={`text-left px-4 py-3.5 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider whitespace-nowrap ${col.field ? 'cursor-pointer hover:text-surface-700 dark:hover:text-surface-200 select-none' : ''}`}
                    onClick={() => col.field && toggleSort(col.field)}
                  >
                    <div className="flex items-center">
                      {col.label}
                      {col.field && <SortIcon field={col.field} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div className="h-4 bg-surface-100 dark:bg-surface-800 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-surface-400">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <p className="font-medium">No records found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                records.map(r => (
                  <tr key={r._id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {r.fullName?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-surface-900 dark:text-white truncate max-w-[140px]">{r.fullName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-surface-600 dark:text-surface-400 truncate max-w-[160px]">{r.email}</td>
                    <td className="px-4 py-3.5 text-surface-600 dark:text-surface-400 font-mono text-xs">{r.phone}</td>
                    <td className="px-4 py-3.5 text-surface-600 dark:text-surface-400 truncate max-w-[150px]">{r.address}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3.5 text-surface-500 dark:text-surface-400 text-xs whitespace-nowrap">
                      {format(new Date(r.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1">
                        <button
                          onClick={() => { setSelected(r); setModal('edit') }}
                          className="p-1.5 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button
                          onClick={() => { setSelected(r); setModal('delete') }}
                          className="p-1.5 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-200 dark:border-surface-800">
            <p className="text-sm text-surface-500 dark:text-surface-400">
              Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => fetchRecords(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >← Prev</button>
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + Math.max(1, pagination.page - 2)).map(p => (
                <button
                  key={p}
                  onClick={() => fetchRecords(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === pagination.page ? 'bg-primary-600 text-white' : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'}`}
                >{p}</button>
              ))}
              <button
                onClick={() => fetchRecords(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {(modal === 'create' || modal === 'edit') && (
        <RecordModal record={modal === 'edit' ? selected : null} onClose={() => setModal(null)} onSave={handleSave} />
      )}
      {modal === 'delete' && (
        <DeleteModal record={selected} onClose={() => setModal(null)} onConfirm={handleDelete} />
      )}
    </div>
  )
}
