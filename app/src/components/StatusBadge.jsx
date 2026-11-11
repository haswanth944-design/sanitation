const C = { Pending:'bg-orange-100 text-orange-700', 'In Progress':'bg-blue-100 text-blue-700',
  Resolved:'bg-green-100 text-green-700', Rejected:'bg-red-100 text-red-700' }
export default function StatusBadge({ status }) {
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${C[status] || ''}`}>{status}</span>
}
