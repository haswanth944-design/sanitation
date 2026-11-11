import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
export function Login() {
  const nav = useNavigate(); const [f, setF] = useState({ email: '', password: '' }); const [busy, setBusy] = useState(false)
  async function submit(e) { e.preventDefault(); setBusy(true)
    const { error } = await supabase.auth.signInWithPassword(f); setBusy(false)
    if (error) return toast.error(error.message); nav('/dashboard') }
  return (<form onSubmit={submit} className="card max-w-md mx-auto my-12 space-y-4">
    <h1 className="text-2xl font-bold text-forest">Login</h1>
    <input className="input" type="email" required placeholder="Email" onChange={e => setF({ ...f, email: e.target.value })} />
    <input className="input" type="password" required placeholder="Password" onChange={e => setF({ ...f, password: e.target.value })} />
    <button className="btn w-full" disabled={busy}>{busy ? 'Signing in…' : 'Login'}</button>
    <p className="text-sm">New villager? <Link className="text-emerald2" to="/register">Register</Link></p></form>)
}
export function Register() {
  const nav = useNavigate(); const [busy, setBusy] = useState(false)
  const [f, setF] = useState({ full_name: '', email: '', mobile_number: '', password: '' })
  async function submit(e) { e.preventDefault()
    if (!/^[0-9]{10}$/.test(f.mobile_number)) return toast.error('Enter a 10-digit mobile number')
    if (f.password.length < 8) return toast.error('Password must be at least 8 characters')
    setBusy(true)
    const { error } = await supabase.auth.signUp({ email: f.email, password: f.password,
      options: { data: { full_name: f.full_name, mobile_number: f.mobile_number } } })
    setBusy(false)
    if (error) return toast.error(error.message)
    toast.success('Registered! Check your email if confirmation is enabled, then log in.'); nav('/login') }
  const set = k => e => setF({ ...f, [k]: e.target.value })
  return (<form onSubmit={submit} className="card max-w-md mx-auto my-12 space-y-4">
    <h1 className="text-2xl font-bold text-forest">Villager Registration</h1>
    <input className="input" required placeholder="Full name" onChange={set('full_name')} />
    <input className="input" type="email" required placeholder="Email" onChange={set('email')} />
    <input className="input" required placeholder="Mobile (10 digits)" onChange={set('mobile_number')} />
    <input className="input" type="password" required placeholder="Password (min 8)" onChange={set('password')} />
    <button className="btn w-full" disabled={busy}>{busy ? 'Creating…' : 'Register'}</button></form>)
}
