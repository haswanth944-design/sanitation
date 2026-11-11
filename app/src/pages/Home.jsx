import { Link } from 'react-router-dom'
import { Trash2, Droplets, Waves, Recycle, Brush, HelpCircle } from 'lucide-react'
const CATS = [[Trash2,'Waste Accumulation'],[Recycle,'Improper Waste Disposal'],[Droplets,'Drainage Blockage'],[Waves,'Overflowing Drains'],[Droplets,'Water Stagnation'],[Brush,'Street Cleanliness'],[HelpCircle,'Other Sanitation Issues']]
export default function Home() {
  return (<div>
    <section className="bg-gradient-to-br from-mint to-white py-20 text-center px-4">
      <h1 className="text-4xl md:text-5xl font-bold text-forest">Together for a Cleaner and Healthier Village</h1>
      <p className="mt-4 text-lg max-w-2xl mx-auto">Report sanitation problems, track complaints, and help improve cleanliness in Chendra Gudem.</p>
      <div className="mt-8 flex justify-center gap-3"><Link to="/dashboard/submit" className="btn">Report an Issue</Link><Link to="/track" className="btn-outline">Track Complaint</Link></div>
    </section>
    <section className="max-w-6xl mx-auto p-8"><h2 className="text-2xl font-bold text-forest mb-4">Sanitation Problems We Handle</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{CATS.map(([I, n]) => <div key={n} className="card flex items-center gap-3"><I className="text-emerald2" />{n}</div>)}</div></section>
    <section className="max-w-6xl mx-auto p-8"><h2 className="text-2xl font-bold text-forest mb-4">How It Works</h2>
      <ol className="grid md:grid-cols-4 gap-4 text-sm">{['Register and log in','Submit complaint with photo','Panchayat officer reviews and acts','Track status and remarks'].map((t, i) =>
        <li key={t} className="card"><b className="text-emerald2 text-xl">{i + 1}</b><p>{t}</p></li>)}</ol></section>
    <section className="max-w-6xl mx-auto p-8"><h2 className="text-2xl font-bold text-forest mb-2">About the Project</h2>
      <p>A Community Service Project by CSE students of Lakireddy Bali Reddy College of Engineering, guided by Mr. Anand Thota, helping villagers report sanitation issues and helping the Panchayat manage them. Future enhancements: GPS location, SMS/WhatsApp alerts, AI classification, Android app.</p></section>
  </div>)
}
