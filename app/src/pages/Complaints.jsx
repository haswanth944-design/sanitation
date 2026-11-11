import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { supabase, signedImageUrl, STATUSES, PRIORITIES } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'
export default function Complaints() {
  const { profile } = useAuth(); const staff = profile.role !== 'villager'
  const [rows, setRows] = useState(null); const [q, setQ] = useState(''); const [st, setSt] = useState(''); const [sel, setSel] = useState(null)
  const load = () => supabase.from('complaints').select('*').order('created_at', { ascending: false }).then(r => setRows(r.data || []))
  useEffect(() => { load() }, [])
  const shown = (rows || []).filter(r => (!st || r.status === st) && r.complaint_number.toLowerCase().includes(q.toLowerCase()))
  function csv() {
    const h = ['complaint_number', 'category', 'status', 'priority', 'location', 'created_at']
    const t = [h.join(','), ...shown.map(r => h.map(k => `"${String(r[k] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([t], { type: 'text/csv' })); a.download = 'complaints.csv'; a.click() }
  return (<div className="space-y-4"><h1 className="text-2xl font-bold text-forest">{staff ? 'All Complaints' : 'My Complaints'}</h1>
    <div className="flex flex-wrap gap-2"><input className="input max-w-xs" placeholder="Search complaint ID" onChange={e => setQ(e.target.value)} />
      <select className="input max-w-[10rem]" onChange={e => setSt(e.target.value)}><option value="">All statuses</option>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
      {staff && <button className="btn-outline" onClick={csv}>Export CSV</button>}</div>
    {!rows ? <p>Loading…</p> : shown.length === 0 ? <p className="card">No complaints found.</p> :
      <div className="card overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left"><th>ID</th><th>Category</th><th>Priority</th><th>Status</th><th>Date</th><th /></tr></thead>
        <tbody>{shown.map(r => <tr key={r.id} className="border-t"><td className="py-2">{r.complaint_number}</td><td>{r.category}</td><td>{r.priority}</td>
          <td><StatusBadge status={r.status} /></td><td>{new Date(r.created_at).toLocaleDateString()}</td>
          <td><button className="text-emerald2" onClick={() => setSel(r)}>Details</button></td></tr>)}</tbody></table></div>}
    {sel && <Detail c={sel} staff={staff} onClose={() => { setSel(null); load() }} />}</div>)
}
function Detail({ c, staff, onClose }) {
  const [img, setImg] = useState(null); const [hist, setHist] = useState([])
  const [status, setStatus] = useState(c.status); const [prio, setPrio] = useState(c.priority); const [rem, setRem] = useState('')
  useEffect(() => { signedImageUrl(c.image_url).then(setImg)
    supabase.from('complaint_updates').select('*').eq('complaint_id', c.id).order('created_at').then(r => setHist(r.data || [])) }, [c])
  async function save() {
    if (!window.confirm(`Update ${c.complaint_number} to "${status}"?`)) return
    const { error } = await supabase.rpc('update_complaint', { p_id: c.id, p_status: status, p_priority: prio, p_remarks: rem })
    if (error) return toast.error(error.message); toast.success('Complaint updated'); onClose() }
  return (<div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"><div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-3">
    <div className="flex justify-between"><h2 className="font-bold text-lg">{c.complaint_number}</h2><button onClick={onClose}>✕</button></div>
    <p><b>{c.category}</b> · <StatusBadge status={c.status} /></p><p>{c.description}</p>
    <p className="text-sm">Location: {c.location}{c.landmark && ` (near ${c.landmark})`}</p>
    {img && <img src={img} alt="Complaint" className="rounded max-h-60" />}
    <h3 className="font-semibold">Timeline</h3>
    <ul className="text-sm border-l-2 border-emerald2 pl-3 space-y-1">{hist.map(h => <li key={h.id}>{new Date(h.created_at).toLocaleString()} — {h.new_status}{h.remarks && `: ${h.remarks}`}</li>)}</ul>
    {staff && <div className="space-y-2 border-t pt-3">
      <select className="input" value={status} onChange={e => setStatus(e.target.value)}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
      <select className="input" value={prio} onChange={e => setPrio(e.target.value)}>{PRIORITIES.map(s => <option key={s}>{s}</option>)}</select>
      <textarea className="input" placeholder="Action remarks" value={rem} onChange={e => setRem(e.target.value)} />
      <button className="btn" onClick={save}>Save update</button></div>}
    <button className="btn-outline" onClick={() => window.print()}>Print</button></div></div>)
}
