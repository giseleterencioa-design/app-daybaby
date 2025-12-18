import { supabase } from './supabase'

// ===== BABIES =====
export async function getBabies(userId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('babies')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function createBaby(
  userId: string,
  baby: { name: string; birth_date: string; photo?: string }
) {
  const { data, error } = await supabase
    .from('babies')
    .insert({
      user_id: userId,
      ...baby,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateBaby(
  babyId: string,
  updates: { name?: string; birth_date?: string; photo?: string }
) {
  const { data, error } = await supabase
    .from('babies')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', babyId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteBaby(babyId: string) {
  const { error } = await supabase
    .from('babies')
    .delete()
    .eq('id', babyId)

  if (error) throw error
}

// ===== ACTIVITIES =====
export async function getActivities(userId: string, babyId?: string) {
  let query = supabase
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('time', { ascending: false })

  if (babyId) {
    query = query.eq('baby_id', babyId)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function createActivity(
  userId: string,
  babyId: string,
  activity: Record<string, any>
) {
  const { data, error } = await supabase
    .from('ac
