import { supabase } from './supabase'

// =====================
// BABIES
// =====================
export async function getBabies(userId: string) {
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
    .select('*')
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
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', babyId)
    .select('*')
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

// =====================
// ACTIVITIES
// =====================
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
    .from('activities')
    .insert({
      user_id: userId,
      baby_id: babyId,
      ...activity,
    })
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function updateActivity(
  activityId: string,
  updates: Record<string, any>
) {
  const { data, error } = await supabase
    .from('activities')
    .update(updates)
    .eq('id', activityId)
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function deleteActivity(activityId: string) {
  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id', activityId)

  if (error) throw error
}

// =====================
// GROWTH RECORDS
// =====================
export async function getGrowthRecords(userId: string, babyId: string) {
  const { data, error } = await supabase
    .from('growth_records')
    .select('*')
    .eq('user_id', userId)
    .eq('baby_id', babyId)
    .order('date', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function createGrowthRecord(
  userId: string,
  babyId: string,
  record: Record<string, any>
) {
  const { data, error } = await supabase
    .from('growth_records')
    .insert({
      user_id: userId,
      baby_id: babyId,
      ...record,
    })
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function deleteGrowthRecord(recordId: string) {
  const { error } = await supabase
    .from('growth_records')
    .delete()
    .eq('id', recordId)

  if (error) throw error
}

// =====================
// TEETH RECORDS
// =====================
export async function getTeethRecords(userId: string, babyId: string
