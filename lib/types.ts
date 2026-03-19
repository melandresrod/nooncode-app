// User and Auth Types
export type UserRole = 'admin' | 'sales_manager' | 'sales' | 'pm' | 'developer'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  createdAt: Date
  points: number
  balance: number
}

// Lead Types
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
export type LeadSource = 'website' | 'referral' | 'cold_call' | 'social' | 'event' | 'other'
export type LeadSourceInput = LeadSource | 'cold_outreach' | 'social_media'
export type LeadAssignmentStatus = 'owned' | 'proposal_locked' | 'released_no_response'

export interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  source: LeadSource
  status: LeadStatus
  score: number
  value: number
  assignedTo?: string
  assignmentStatus: LeadAssignmentStatus
  lockedByProposalId?: string
  lockedAt?: Date
  releasedAt?: Date
  notes?: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  lastContactedAt?: Date
  nextFollowUpAt?: Date
}

export interface LeadDraft extends Omit<
  Lead,
  'id' | 'createdAt' | 'updatedAt' | 'source' | 'assignmentStatus' | 'lockedByProposalId' | 'lockedAt' | 'releasedAt'
> {
  source: LeadSourceInput
}

export type LeadUpdates = Partial<Omit<LeadDraft, 'nextFollowUpAt'>> & {
  nextFollowUpAt?: Date | null
}

export type LeadActivityType = 'created' | 'updated' | 'status_changed' | 'note_added'
  | 'proposal_created'
  | 'proposal_status_changed'
  | 'project_created'
  | 'released_no_response'
  | 'claimed'

export interface LeadActivity {
  id: string
  leadId: string
  type: LeadActivityType
  actorId?: string
  actorName: string
  noteBody?: string
  metadata?: Record<string, unknown>
  createdAt: Date
}

export type ProposalStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'handoff_ready'

export interface LeadProposal {
  id: string
  leadId: string
  title: string
  body: string
  amount: number
  currency: string
  status: ProposalStatus
  createdAt: Date
  updatedAt: Date
  sentAt?: Date
  acceptedAt?: Date
  handoffReadyAt?: Date
}

// Project Types
export type ProjectStatus = 'backlog' | 'in_progress' | 'review' | 'delivered' | 'completed'
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskActivityType = 'note_added'

export interface Project {
  id: string
  name: string
  description?: string
  clientId?: string
  clientName: string
  status: ProjectStatus
  budget: number
  startDate?: Date
  endDate?: Date
  pmId?: string
  pmName?: string
  teamIds: string[]
  createdAt: Date
  updatedAt: Date
  sourceLeadId?: string
  sourceProposalId?: string
  handoffReadyAt?: Date
}

export type ProjectDraft = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
export type ProjectUpdates = Partial<Omit<ProjectDraft, 'description' | 'pmId' | 'startDate' | 'endDate'>> & {
  description?: string | null
  pmId?: string | null
  startDate?: Date | null
  endDate?: Date | null
}

export interface Task {
  id: string
  projectId: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assignedTo?: string
  assignedToName?: string
  dueDate?: Date
  estimatedHours?: number
  actualHours?: number
  createdAt: Date
  updatedAt: Date
}

export type TaskDraft = Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & {
  assigneeId?: string
  assigneeName?: string
}

export type TaskUpdates = Partial<TaskDraft>

export interface TaskActivity {
  id: string
  taskId: string
  type: TaskActivityType
  actorId?: string
  actorName: string
  noteBody?: string
  metadata?: Record<string, unknown>
  createdAt: Date
}

export interface ProjectTaskActivity {
  id: string
  taskId: string
  taskTitle: string
  type: TaskActivityType
  actorId?: string
  actorName: string
  noteBody?: string
  createdAt: Date
}

// Payment Types
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'

export interface Payment {
  id: string
  projectId: string
  amount: number
  status: PaymentStatus
  stripePaymentId?: string
  createdAt: Date
  completedAt?: Date
}

export interface Commission {
  id: string
  userId: string
  projectId: string
  amount: number
  percentage: number
  status: 'pending' | 'approved' | 'paid'
  createdAt: Date
  paidAt?: Date
}

// Points and Rewards Types
export type PointEventType = 'sale_closed' | 'milestone_reached' | 'sla_met' | 'referral' | 'bonus'

export interface PointEvent {
  id: string
  userId: string
  type: PointEventType
  points: number
  description: string
  referenceId?: string
  createdAt: Date
}

export interface Reward {
  id: string
  name: string
  description: string
  pointsCost: number
  category: 'gift_card' | 'experience' | 'merchandise' | 'time_off' | 'bonus'
  available: boolean
  imageUrl?: string
}

export interface RewardRedemption {
  id: string
  userId: string
  rewardId: string
  pointsSpent: number
  status: 'pending' | 'approved' | 'fulfilled' | 'rejected'
  createdAt: Date
  fulfilledAt?: Date
}

// Activity Types
export interface Activity {
  id: string
  userId: string
  userName: string
  action: string
  entityType: 'lead' | 'project' | 'task' | 'payment' | 'user'
  entityId: string
  entityName: string
  metadata?: Record<string, unknown>
  createdAt: Date
}

// Dashboard Stats
export interface SalesStats {
  totalLeads: number
  leadsThisMonth: number
  conversionRate: number
  totalRevenue: number
  revenueThisMonth: number
  avgDealSize: number
  pipelineValue: number
  closedDeals: number
}

export interface DeliveryStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  onTrack: number
  atRisk: number
  delayed: number
  avgDeliveryTime: number
  teamUtilization: number
}

export interface UserStats {
  totalEarnings: number
  pendingCommissions: number
  totalPoints: number
  leadsAssigned: number
  dealsWon: number
  tasksCompleted: number
}
