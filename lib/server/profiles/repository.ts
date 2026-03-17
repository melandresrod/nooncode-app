import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/server/supabase/database.types'
import type {
  SeedProfileInput,
  UserProfile,
  UserProfileInsert,
  UserProfileUpdate,
} from '@/lib/server/profiles/types'

type DatabaseClient = SupabaseClient<Database>
export type SelfServiceProfileUpdate = Pick<
  UserProfileUpdate,
  'full_name' | 'avatar_url' | 'locale' | 'timezone'
>

export async function getUserProfileById(
  client: DatabaseClient,
  userId: string
): Promise<UserProfile | null> {
  const { data, error } = await client
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to load user profile by id: ${error.message}`)
  }

  return data
}

export async function getUserProfileByEmail(
  client: DatabaseClient,
  email: string
): Promise<UserProfile | null> {
  const normalizedEmail = email.toLowerCase()
  const { data, error } = await client
    .from('user_profiles')
    .select('*')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to load user profile by email: ${error.message}`)
  }

  return data
}

export async function upsertUserProfile(
  client: DatabaseClient,
  profile: UserProfileInsert
): Promise<UserProfile> {
  const normalizedProfile: UserProfileInsert = {
    ...profile,
    email: profile.email.toLowerCase(),
  }

  const { data, error } = await client
    .from('user_profiles')
    .upsert(normalizedProfile)
    .select('*')
    .single()

  if (error || !data) {
    throw new Error(`Failed to upsert user profile: ${error?.message ?? 'No profile returned.'}`)
  }

  return data
}

export async function updateUserProfile(
  client: DatabaseClient,
  userId: string,
  updates: SelfServiceProfileUpdate
): Promise<UserProfile> {
  const normalizedUpdates: SelfServiceProfileUpdate = {
    ...updates,
  }

  const { data, error } = await client
    .from('user_profiles')
    .update(normalizedUpdates)
    .eq('id', userId)
    .select('*')
    .single()

  if (error || !data) {
    throw new Error(`Failed to update user profile: ${error?.message ?? 'No profile returned.'}`)
  }

  return data
}

export async function touchUserLastLogin(
  client: DatabaseClient,
  userId: string,
  at: Date = new Date()
): Promise<void> {
  const { error } = await client
    .from('user_profiles')
    .update({ last_login_at: at.toISOString() })
    .eq('id', userId)

  if (error) {
    throw new Error(`Failed to update last login timestamp: ${error.message}`)
  }
}

export function mapSeedInputToProfileInsert(
  userId: string,
  input: SeedProfileInput
): UserProfileInsert {
  return {
    id: userId,
    email: input.email.toLowerCase(),
    full_name: input.fullName,
    role: input.role,
    is_active: true,
    legacy_mock_id: input.legacyMockId,
  }
}
