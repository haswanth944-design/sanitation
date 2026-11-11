import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Leaf, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
export function PublicLayout() {
  const { session, signOut } = useAuth()
  return (<div className="min-h-screen flex flex-col">
    <header className="bg-white shadow-sm"><nav className="max-w-6xl mx-auto flex items-center justify-between p-4">
      <Link to="/" className="flex items-center gap-2 font-bold text-forest"><Leaf /> Chendra Gudem Sanitation</Link>
      <div className="flex items-center gap-4 text-sm">
        <Link to="/track">Track Complaint</Link>
        {session ? <><Link to="/dashboard" className="btn">Dashboard</Link><button className="btn-outline" onClick={signOut}>Logout</button></>
          : <><Link to="/login">Login</Link><Link to="/register" className="btn">Register</Link></>}
      </div></nav></header>
    <main className="flex-1"><Outlet /></main>
    <footer className="bg-forest text-white text-sm p-6 text-center">
      Smart Sanitation Complaint Management System · Chendra Gudem, Andhra Pradesh 521230<br />
      Lakireddy Bali Reddy College of Engineering · Dept. of CSE · Community Service Project 2026</footer></div>)
}
const LINKS = {
  villager: [['/dashboard','Overview'],['/dashboard/submit','Submit Complaint'],['/dashboard/complaints','My Complaints'],['/dashboard/notifications','Notifications']],
  officer: [['/dashboard','Overview'],['/dashboard/complaints','All Complaints']],
  admin: [['/dashboard','Overview'],['/dashboard/complaints','All Complaints'],['/dashboard/users','User Management'],['/dashboard/logs','Activity Logs']] }
export function DashboardLayout() {
  const { profile, signOut } = useAuth(); const nav = useNavigate()
  return (<div className="min-h-screen md:flex">
    <aside className="md:w-60 bg-forest text-white p-4 space-y-1">
      <Link to="/" className="flex items-center gap-2 font-bold mb-4"><Leaf /> Sanitation Portal</Link>
      <p className="text-xs uppercase opacity-70">{profile?.role}</p>
      {(LINKS[profile?.role] || []).map(([to, label]) =>
        <NavLink key={to} end to={to} className={({ isActive }) => `block rounded px-3 py-2 ${isActive ? 'bg-emerald2' : 'hover:bg-emerald2/60'}`}>{label}</NavLink>)}
      <button onClick={async () => { await signOut(); nav('/') }} className="flex items-center gap-2 px-3 py-2 mt-4"><LogOut size={16} /> Logout</button>
    </aside><main className="flex-1 p-6"><Outlet /></main></div>)
}
