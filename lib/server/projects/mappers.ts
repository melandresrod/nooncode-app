import type { ProjectWire } from '@/lib/projects/serialization'
import type {
  ProjectInsert,
  ProjectRow,
  ProjectUpdate,
} from '@/lib/server/projects/types'
import type { LeadRowWithProfiles } from '@/lib/server/leads/types'
import type { LeadProposalRow } from '@/lib/server/leads/proposal-types'
import type { UpdateProjectInput } from '@/lib/server/projects/schema'

export function mapProjectRowToWire(row: ProjectRow): ProjectWire {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    clientId: undefined,
    clientName: row.client_name,
    status: row.status,
    budget: Number(row.budget),
    pmId: row.pm_legacy_user_id,
    pmName: undefined,
    teamIds: row.team_legacy_user_ids ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    startDate: row.start_date,
    endDate: row.end_date,
    sourceLeadId: row.source_lead_id,
    sourceProposalId: row.source_proposal_id,
    handoffReadyAt: row.handoff_ready_at,
  }
}

export function mapLeadAndProposalToProjectInsert(
  lead: LeadRowWithProfiles,
  proposal: LeadProposalRow,
  principalUserId: string
): ProjectInsert {
  return {
    source_lead_id: lead.id,
    source_proposal_id: proposal.id,
    created_by: principalUserId,
    name: proposal.title,
    description: proposal.body,
    client_name: lead.company ?? lead.name,
    status: 'backlog',
    budget: Number(proposal.amount),
    pm_legacy_user_id: null,
    team_legacy_user_ids: [],
    handoff_ready_at: proposal.handoff_ready_at ?? proposal.accepted_at ?? new Date().toISOString(),
    start_date: null,
    end_date: null,
  }
}

export function mapUpdateProjectInputToUpdate(
  input: UpdateProjectInput
): ProjectUpdate {
  const update: ProjectUpdate = {}

  if (input.name !== undefined) update.name = input.name
  if (input.clientName !== undefined) update.client_name = input.clientName
  if (input.description !== undefined) update.description = input.description ?? null
  if (input.status !== undefined) update.status = input.status
  if (input.budget !== undefined) update.budget = input.budget
  if (input.pmId !== undefined) update.pm_legacy_user_id = input.pmId ?? null
  if (input.teamIds !== undefined) {
    update.team_legacy_user_ids = Array.from(new Set(input.teamIds))
  }
  if (input.startDate !== undefined) update.start_date = input.startDate ?? null
  if (input.endDate !== undefined) update.end_date = input.endDate ?? null

  return update
}
