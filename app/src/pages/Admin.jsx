import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
export function Users() {
  const [rows, setRows] = useState([])
  const load = () => supabase.from('profiles').select('*').order('created_at', { ascending: false }).then(r => setRows(r.data || []))
  useEffect(() => { load() }, [])
  async function setRole(u, role) {
    if (!window.confirm(`Change ${u.email} to ${role}?`)) return
    const { error } = await supabase.rpc('admin_set_role', { p_user: u.id, p_role: role })
    if (error) return toast.error(error.message); toast.success('Role updated'); load() }
  return (<div className="space-y-3"><h1 className="text-2xl font-bold text-forest">User & Officer Management</h1>
    <p className="text-sm">Ask the officer to register as a villager, then promote them here.</p>
    <div className="card overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left"><th>Name</th><th>Email</th><th>Role</th></tr></thead>
      <tbody>{rows.map(u => <tr key={u.id} className="border-t"><td className="py-2">{u.full_name}</td><td>{u.email}</td>
        <td><select value={u.role} onChange={e => setRole(u, e.target.value)}>{['villager', 'officer', 'admin'].map(r => <option key={r}>{r}</option>)}</select></td></tr>)}</tbody></table></div></div>)
}
export function Logs() {
  const [rows, setRows] = useState([])
  useEffect(() => { supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(100).then(r => setRows(r.data || [])) }, [])
  return (<div className="space-y-3"><h1 className="text-2xl font-bold text-forest">Activity Logs</h1>
    {rows.length === 0 ? <p className="card">No activity yet.</p> : <div className="card">{rows.map(l => <p key={l.id} className="text-sm border-b py-1">{new Date(l.created_at).toLocaleString()} — {l.action} ({l.entity_type} {l.entity_id})</p>)}</div>}</div>)
}
