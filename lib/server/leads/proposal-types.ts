import type { Database } from '@/lib/server/supabase/database.types'

export type LeadProposalRow = Database['public']['Tables']['lead_proposals']['Row']
export type LeadProposalInsert = Database['public']['Tables']['lead_proposals']['Insert']
export type LeadProposalUpdate = Database['public']['Tables']['lead_proposals']['Update']
