import { Routes, Route } from 'react-router-dom'
import { PublicLayout, DashboardLayout } from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import { Login, Register } from './pages/Auth'
import Track from './pages/Track'
import Overview from './pages/Overview'
import SubmitComplaint from './pages/SubmitComplaint'
import Complaints from './pages/Complaints'
import Notifications from './pages/Notifications'
import { Users, Logs } from './pages/Admin'
export default function App() {
  return (<Routes>
    <Route element={<PublicLayout />}>
      <Route path="/" element={<Home />} /><Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} /><Route path="/track" element={<Track />} />
    </Route>
    <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
      <Route index element={<Overview />} />
      <Route path="submit" element={<ProtectedRoute roles={['villager']}><SubmitComplaint /></ProtectedRoute>} />
      <Route path="complaints" element={<Complaints />} />
      <Route path="notifications" element={<ProtectedRoute roles={['villager']}><Notifications /></ProtectedRoute>} />
      <Route path="users" element={<ProtectedRoute roles={['admin']}><Users /></ProtectedRoute>} />
      <Route path="logs" element={<ProtectedRoute roles={['admin']}><Logs /></ProtectedRoute>} />
    </Route></Routes>)
}
