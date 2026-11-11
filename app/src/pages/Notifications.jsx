import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
export default function Notifications() {
  const [rows, setRows] = useState([])
  const load = () => supabase.from('notifications').select('*').order('created_at', { ascending: false }).then(r => setRows(r.data || []))
  useEffect(() => { load() }, [])
  async function read(id) { await supabase.from('notifications').update({ is_read: true }).eq('id', id); load() }
  return (<div className="max-w-2xl space-y-3"><h1 className="text-2xl font-bold text-forest">Notifications</h1>
    {rows.length === 0 && <p className="card">No notifications yet.</p>}
    {rows.map(n => <div key={n.id} className={`card ${n.is_read ? 'opacity-60' : ''}`}><b>{n.title}</b><p className="text-sm">{n.message}</p>
      {!n.is_read && <button className="btn-outline mt-2" onClick={() => read(n.id)}>Mark read</button>}</div>)}</div>)
}
