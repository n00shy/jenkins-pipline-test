import { useState, useEffect } from 'react'

const initialForm = { fullName: '', email: '', phone: '', address: '', status: 'active', notes: '' }

export default function RecordModal({ record, onClose, onSave }) {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (record) {
      setForm({
        fullName: record.fullName || '',
        email: record.email || '',
        phone: record.phone || '',
        address: record.address || '',
        status: record.status || 'active',
        notes: record.notes || ''
      })
    } else {
      setForm(initialForm)
    }
    setErrors({})
  }, [record])

  const validate = () => {
    const e = {}
    if (!form.fullName.trim()) e.fullName = 'Full name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email format'
    if (!form.phone.trim()) e.phone = 'Phone is required'
    if (!form.address.trim()) e.address = 'Address is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await onSave(form)
    } finally {
      setLoading(false)
    }
  }

  const Field = ({ name, label, type = 'text', placeholder }) => (
    <div>
      <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">{label}</label>
      <input
        type={type}
        className={`input-field ${errors[name] ? 'border-red-400 focus:ring-red-400' : ''}`}
        placeholder={placeholder}
        value={form[name]}
        onChange={e => { setForm(f => ({ ...f, [name]: e.target.value })); setErrors(er => ({ ...er, [name]: '' })) }}
      />
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-surface-200 dark:border-surface-800">
          <h2 className="text-xl font-bold text-surface-900 dark:text-white">
            {record ? 'Edit Record' : 'New Record'}
          </h2>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-600 transition-colors p-1">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Field name="fullName" label="Full Name" placeholder="John Doe" />
          <Field name="email" label="Email Address" type="email" placeholder="john@example.com" />
          <Field name="phone" label="Phone Number" placeholder="+1 234 567 8900" />
          <Field name="address" label="Address" placeholder="123 Main St, City, Country" />

          <div>
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Status</label>
            <select
              className="input-field"
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
              Notes <span className="text-surface-400 font-normal">(optional)</span>
            </label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="Any additional notes..."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
              ) : record ? 'Update Record' : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
