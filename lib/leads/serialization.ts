import type { Lead } from '@/lib/types'

export interface LeadWire {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  source: Lead['source']
  status: Lead['status']
  score: number
  value: number
  assignedTo: string | null
  notes: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
  lastContactedAt: string | null
}

export function deserializeLead(lead: LeadWire): Lead {
  return {
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone ?? undefined,
    company: lead.company ?? undefined,
    source: lead.source,
    status: lead.status,
    score: lead.score,
    value: lead.value,
    assignedTo: lead.assignedTo ?? undefined,
    notes: lead.notes ?? undefined,
    tags: lead.tags,
    createdAt: new Date(lead.createdAt),
    updatedAt: new Date(lead.updatedAt),
    lastContactedAt: lead.lastContactedAt ? new Date(lead.lastContactedAt) : undefined,
  }
}
