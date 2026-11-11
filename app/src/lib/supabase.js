import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
export const envMissing = !url || !key

export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  key || 'placeholder'
)

export const STATUSES = ['Pending','In Progress','Resolved','Rejected']
export const PRIORITIES = ['Low','Medium','High','Urgent']

export async function signedImageUrl(path) {
  if (!path) return null
  const { data } = await supabase.storage.from('complaint-images').createSignedUrl(path, 3600)
  return data?.signedUrl ?? null
}