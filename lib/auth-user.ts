import { mockUsers } from '@/lib/mock-data'
import type { User } from '@/lib/types'
import type { UserProfile } from '@/lib/server/profiles/types'

export type AuthMode = 'mock' | 'supabase'

export function mapProfileToClientUser(profile: UserProfile): User {
  const fallbackUser =
    mockUsers.find((user) => user.email.toLowerCase() === profile.email.toLowerCase()) ??
    mockUsers.find((user) => user.id === profile.legacy_mock_id)

  return {
    id: profile.legacy_mock_id ?? fallbackUser?.id ?? profile.id,
    email: profile.email,
    name: profile.full_name,
    role: profile.role,
    avatar: profile.avatar_url ?? fallbackUser?.avatar,
    createdAt: fallbackUser?.createdAt ?? new Date(profile.created_at),
    points: fallbackUser?.points ?? 0,
    balance: fallbackUser?.balance ?? 0,
  }
}
