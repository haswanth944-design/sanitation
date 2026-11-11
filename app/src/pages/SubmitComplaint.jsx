import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
const OK = ['image/jpeg', 'image/png', 'image/webp'], MAX = 3 * 1024 * 1024
export default function SubmitComplaint() {
  const { session } = useAuth(); const [cats, setCats] = useState([]); const [busy, setBusy] = useState(false)
  const [f, setF] = useState({ category: '', description: '', location: '', landmark: '' })
  const [file, setFile] = useState(null); const [done, setDone] = useState(null)
  useEffect(() => { supabase.from('categories').select('name').eq('is_active', true).then(r => setCats(r.data || [])) }, [])
  function pick(e) { const x = e.target.files[0]; if (!x) return
    if (!OK.includes(x.type)) return toast.error('Only JPG, PNG or WebP images allowed')
    if (x.size > MAX) return toast.error('Image must be under 3 MB'); setFile(x) }
  async function submit(e) { e.preventDefault()
    if (!f.category) return toast.error('Select a category')
    if (f.description.trim().length < 10) return toast.error('Description must be at least 10 characters')
    if (f.location.trim().length < 3) return toast.error('Enter the location')
    setBusy(true)
    let path = null
    if (file) { path = `${session.user.id}/${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`
      const { error } = await supabase.storage.from('complaint-images').upload(path, file)
      if (error) { setBusy(false); return toast.error('Image upload failed: ' + error.message) } }
    const { data, error } = await supabase.from('complaints').insert({ user_id: session.user.id, ...f, image_url: path }).select().single()
    if (!error) await supabase.from('complaint_updates').insert({ complaint_id: data.id, updated_by: session.user.id, new_status: 'Pending', remarks: 'Complaint submitted' })
    setBusy(false)
    if (error) return toast.error(error.message)
    setDone(data.complaint_number); toast.success('Complaint submitted') }
  if (done) return <div className="card max-w-xl"><h2 className="text-xl font-bold text-forest">Complaint submitted</h2><p>Your complaint ID: <b>{done}</b></p></div>
  const set = k => e => setF({ ...f, [k]: e.target.value })
  return (<form onSubmit={submit} className="card max-w-xl space-y-4"><h1 className="text-2xl font-bold text-forest">Submit Complaint</h1>
    <select className="input" required onChange={set('category')} defaultValue=""><option value="" disabled>Select category</option>{cats.map(c => <option key={c.name}>{c.name}</option>)}</select>
    <textarea className="input" rows="4" required placeholder="Describe the problem" onChange={set('description')} />
    <input className="input" required placeholder="Location / street" onChange={set('location')} />
    <input className="input" placeholder="Landmark (optional)" onChange={set('landmark')} />
    <input type="file" accept={OK.join(',')} onChange={pick} />
    {file && <img alt="preview" src={URL.createObjectURL(file)} className="h-40 rounded" />}
    <button className="btn" disabled={busy}>{busy ? 'Submitting…' : 'Submit Complaint'}</button></form>)
}
