import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/server/supabase/database.types'
import type {
  ProjectInsert,
  ProjectRow,
  ProjectUpdate,
} from '@/lib/server/projects/types'

type DatabaseClient = SupabaseClient<Database>

const projectSelect = `
  id,
  source_lead_id,
  source_proposal_id,
  created_by,
  name,
  description,
  client_name,
  status,
  budget,
  pm_legacy_user_id,
  team_legacy_user_ids,
  handoff_ready_at,
  start_date,
  end_date,
  created_at,
  updated_at
`

export async function listProjects(client: DatabaseClient): Promise<ProjectRow[]> {
  const { data, error } = await client
    .from('projects')
    .select(projectSelect)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to list projects: ${error.message}`)
  }

  return (data ?? []) as ProjectRow[]
}

export async function getProjectById(
  client: DatabaseClient,
  projectId: string
): Promise<ProjectRow | null> {
  const { data, error } = await client
    .from('projects')
    .select(projectSelect)
    .eq('id', projectId)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to load project: ${error.message}`)
  }

  return (data ?? null) as ProjectRow | null
}

export async function getProjectByProposalId(
  client: DatabaseClient,
  proposalId: string
): Promise<ProjectRow | null> {
  const { data, error } = await client
    .from('projects')
    .select(projectSelect)
    .eq('source_proposal_id', proposalId)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to load project by proposal: ${error.message}`)
  }

  return (data ?? null) as ProjectRow | null
}

export async function createProject(
  client: DatabaseClient,
  project: ProjectInsert
): Promise<ProjectRow> {
  const { data, error } = await client
    .from('projects')
    .insert(project)
    .select(projectSelect)
    .single()

  if (error || !data) {
    throw new Error(`Failed to create project: ${error?.message ?? 'No project returned.'}`)
  }

  return data as ProjectRow
}

export async function updateProjectById(
  client: DatabaseClient,
  projectId: string,
  updates: ProjectUpdate
): Promise<ProjectRow> {
  const { data, error } = await client
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select(projectSelect)
    .single()

  if (error || !data) {
    throw new Error(`Failed to update project: ${error?.message ?? 'No project returned.'}`)
  }

  return data as ProjectRow
}
