import type { LeadProposalWire } from '@/lib/leads/proposal-serialization'
import type {
  CreateLeadProposalInput,
  UpdateLeadProposalInput,
} from '@/lib/server/leads/proposal-schema'
import type {
  LeadProposalInsert,
  LeadProposalRow,
  LeadProposalUpdate,
} from '@/lib/server/leads/proposal-types'

export function mapLeadProposalRowToWire(row: LeadProposalRow): LeadProposalWire {
  return {
    id: row.id,
    leadId: row.lead_id,
    title: row.title,
    body: row.body,
    amount: Number(row.amount),
    currency: row.currency,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    sentAt: row.sent_at,
    acceptedAt: row.accepted_at,
    handoffReadyAt: row.handoff_ready_at,
  }
}

export function mapCreateLeadProposalInputToInsert(
  input: CreateLeadProposalInput,
  leadId: string,
  principalUserId: string
): LeadProposalInsert {
  return {
    lead_id: leadId,
    created_by: principalUserId,
    title: input.title,
    body: input.body,
    amount: input.amount,
    currency: input.currency,
    status: input.status,
    sent_at: input.status === 'sent' ? new Date().toISOString() : null,
    accepted_at: input.status === 'accepted' || input.status === 'handoff_ready' ? new Date().toISOString() : null,
    handoff_ready_at: input.status === 'handoff_ready' ? new Date().toISOString() : null,
  }
}

export function mapUpdateLeadProposalInputToUpdate(
  input: UpdateLeadProposalInput
): LeadProposalUpdate {
  const now = new Date().toISOString()

  return {
    status: input.status,
    sent_at: input.status === 'sent' ? now : undefined,
    accepted_at: input.status === 'accepted' || input.status === 'handoff_ready' ? now : undefined,
    handoff_ready_at: input.status === 'handoff_ready' ? now : undefined,
  }
}
