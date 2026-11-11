import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  async function loadProfile(uid) {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single()
    setProfile(data)
  }
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)
      if (data.session) await loadProfile(data.session.user.id)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      if (s) loadProfile(s.user.id); else setProfile(null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])
  const value = { session, profile, loading, reloadProfile: () => session && loadProfile(session.user.id),
    signOut: () => supabase.auth.signOut() }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
