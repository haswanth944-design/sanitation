import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
const COL = { Pending: '#f97316', 'In Progress': '#3b82f6', Resolved: '#16a34a', Rejected: '#dc2626' }
export default function Overview() {
  const { profile } = useAuth(); const [rows, setRows] = useState(null)
  useEffect(() => { supabase.from('complaints').select('status,category').then(r => setRows(r.data || [])) }, [])
  if (!rows) return <p>Loading…</p>
  const count = s => rows.filter(r => r.status === s).length
  const byStatus = Object.keys(COL).map(s => ({ name: s, value: count(s) })).filter(d => d.value)
  const cats = {}; rows.forEach(r => cats[r.category] = (cats[r.category] || 0) + 1)
  const byCat = Object.entries(cats).map(([name, value]) => ({ name, value }))
  return (<div className="space-y-6"><h1 className="text-2xl font-bold text-forest">Welcome, {profile.full_name}</h1>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[['Total', rows.length], ['Pending', count('Pending')], ['In Progress', count('In Progress')], ['Resolved', count('Resolved')]].map(([l, v]) =>
        <div key={l} className="card"><p className="text-sm">{l}</p><p className="text-3xl font-bold">{v}</p></div>)}</div>
    {rows.length === 0 ? <p className="card">No complaints yet.</p> :
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card h-72"><ResponsiveContainer><PieChart><Pie data={byStatus} dataKey="value" nameKey="name" label>{byStatus.map(d => <Cell key={d.name} fill={COL[d.name]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
        <div className="card h-72"><ResponsiveContainer><BarChart data={byCat}><XAxis dataKey="name" hide /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#059669" /></BarChart></ResponsiveContainer></div></div>}</div>)
}
