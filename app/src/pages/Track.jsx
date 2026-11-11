import { useState } from 'react'
import { supabase } from '../lib/supabase'
import StatusBadge from '../components/StatusBadge'
export default function Track() {
  const [num, setNum] = useState(''); const [res, setRes] = useState(undefined)
  async function go(e) { e.preventDefault()
    const { data } = await supabase.rpc('track_complaint', { p_number: num }); setRes(data?.[0] ?? null) }
  return (<div className="max-w-xl mx-auto my-12 px-4"><form onSubmit={go} className="card space-y-3">
    <h1 className="text-2xl font-bold text-forest">Track Complaint</h1>
    <input className="input" required placeholder="e.g. CG-2026-1001" value={num} onChange={e => setNum(e.target.value)} />
    <button className="btn">Track</button></form>
    {res === null && <p className="mt-4 text-red-600">No complaint found with that ID.</p>}
    {res && <div className="card mt-4 space-y-1"><b>{res.complaint_number}</b><p>{res.category}</p><StatusBadge status={res.status} />
      <p className="text-sm">Priority: {res.priority} · Updated {new Date(res.updated_at).toLocaleString()}</p></div>}</div>)
}
