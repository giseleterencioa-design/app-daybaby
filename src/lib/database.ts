import { supabase, Baby, Activity, GrowthRecord, ToothRecord, CustomActivityType, UserSettings } from './supabase'

// ===== BABIES =====
export async function getBabies(userId: string) {
  const { data, error } = await supabase
    .from('babies')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as Baby[]
}

export async function createBaby(userId: string, baby: { name: string; birth_date: string; photo?: string }) {
  const { data, error } = await supabase
    .from('babies')
    .insert({
      user_id: userId,
      ...baby,
    })
    .select()
    .single()

  if (error) throw error
  return data as Baby
}

export async function updateBaby(babyId: string, updates: { name?: string; birth_date?: string; photo?: string }) {
  const { data, error } = await supabase
    .from('babies')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', babyId)
    .select()
    .single()

  if (error) throw error
  return data as Baby
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
  return data as Activity[]
}

export async function createActivity(userId: string, babyId: string, activity: Omit<Activity, 'id' | 'user_id' | 'baby_id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('activities')
    .insert({
      user_id: userId,
      baby_id: babyId,
      ...activity,
    })
    .select()
    .single()

  if (error) throw error
  return data as Activity
}

export async function updateActivity(activityId: string, updates: Partial<Activity>) {
  const { data, error } = await supabase
    .from('activities')
    .update(updates)
    .eq('id', activityId)
    .select()
    .single()

  if (error) throw error
  return data as Activity
}

export async function deleteActivity(activityId: string) {
  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id', activityId)

  if (error) throw error
}

// ===== GROWTH RECORDS =====
export async function getGrowthRecords(userId: string, babyId: string) {
  const { data, error } = await supabase
    .from('growth_records')
    .select('*')
    .eq('user_id', userId)
    .eq('baby_id', babyId)
    .order('date', { ascending: false })

  if (error) throw error
  return data as GrowthRecord[]
}

export async function createGrowthRecord(userId: string, babyId: string, record: Omit<GrowthRecord, 'id' | 'user_id' | 'baby_id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('growth_records')
    .insert({
      user_id: userId,
      baby_id: babyId,
      ...record,
    })
    .select()
    .single()

  if (error) throw error
  return data as GrowthRecord
}

export async function deleteGrowthRecord(recordId: string) {
  const { error } = await supabase
    .from('growth_records')
    .delete()
    .eq('id', recordId)

  if (error) throw error
}

// ===== TEETH RECORDS =====
export async function getTeethRecords(userId: string, babyId: string) {
  const { data, error } = await supabase
    .from('teeth_records')
    .select('*')
    .eq('user_id', userId)
    .eq('baby_id', babyId)
    .order('position', { ascending: true })

  if (error) throw error
  return data as ToothRecord[]
}

export async function createTeethRecords(userId: string, babyId: string, records: Omit<ToothRecord, 'id' | 'user_id' | 'baby_id' | 'created_at'>[]) {
  const { data, error } = await supabase
    .from('teeth_records')
    .insert(
      records.map(record => ({
        user_id: userId,
        baby_id: babyId,
        ...record,
      }))
    )
    .select()

  if (error) throw error
  return data as ToothRecord[]
}

export async function updateToothRecord(toothId: string, updates: { erupted?: boolean; eruption_date?: string | null }) {
  const { data, error } = await supabase
    .from('teeth_records')
    .update(updates)
    .eq('id', toothId)
    .select()
    .single()

  if (error) throw error
  return data as ToothRecord
}

// ===== CUSTOM ACTIVITY TYPES =====
export async function getCustomActivityTypes(userId: string) {
  const { data, error } = await supabase
    .from('custom_activity_types')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as CustomActivityType[]
}

export async function createCustomActivityType(userId: string, activityType: Omit<CustomActivityType, 'id' | 'user_id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('custom_activity_types')
    .insert({
      user_id: userId,
      ...activityType,
    })
    .select()
    .single()

  if (error) throw error
  return data as CustomActivityType
}

export async function deleteCustomActivityType(activityTypeId: string) {
  const { error } = await supabase
    .from('custom_activity_types')
    .delete()
    .eq('id', activityTypeId)

  if (error) throw error
}

// ===== USER SETTINGS =====
export async function getUserSettings(userId: string) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data as UserSettings
}

export async function updateUserSettings(userId: string, settings: Partial<UserSettings>) {
  const { data, error } = await supabase
    .from('user_settings')
    .update({ ...settings, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data as UserSettings
}
