import type { LeadProposal } from '@/lib/types'

export interface LeadProposalWire {
  id: string
  leadId: string
  title: string
  body: string
  amount: number
  currency: string
  status: LeadProposal['status']
  createdAt: string
  updatedAt: string
  sentAt: string | null
  acceptedAt: string | null
  handoffReadyAt: string | null
}

export function deserializeLeadProposal(proposal: LeadProposalWire): LeadProposal {
  return {
    id: proposal.id,
    leadId: proposal.leadId,
    title: proposal.title,
    body: proposal.body,
    amount: proposal.amount,
    currency: proposal.currency,
    status: proposal.status,
    createdAt: new Date(proposal.createdAt),
    updatedAt: new Date(proposal.updatedAt),
    sentAt: proposal.sentAt ? new Date(proposal.sentAt) : undefined,
    acceptedAt: proposal.acceptedAt ? new Date(proposal.acceptedAt) : undefined,
    handoffReadyAt: proposal.handoffReadyAt ? new Date(proposal.handoffReadyAt) : undefined,
  }
}
