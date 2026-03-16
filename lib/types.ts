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
  notes?: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  lastContactedAt?: Date
}

export interface LeadDraft extends Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'source'> {
  source: LeadSourceInput
}

export type LeadUpdates = Partial<LeadDraft>

// Project Types
export type ProjectStatus = 'backlog' | 'in_progress' | 'review' | 'delivered' | 'completed'
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

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
}

export type ProjectDraft = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
export type ProjectUpdates = Partial<ProjectDraft>

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
