export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'sales_manager' | 'sales' | 'pm' | 'developer'
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
export type LeadSource = 'website' | 'referral' | 'cold_call' | 'social' | 'event' | 'other'
export type LeadAssignmentStatus = 'owned' | 'proposal_locked' | 'released_no_response'
export type LeadActivityType =
  | 'created'
  | 'updated'
  | 'status_changed'
  | 'note_added'
  | 'proposal_created'
  | 'proposal_status_changed'
  | 'project_created'
  | 'released_no_response'
  | 'claimed'
export type ProposalStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'handoff_ready'
export type ProjectStatus = 'backlog' | 'in_progress' | 'review' | 'delivered' | 'completed'
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskActivityType = 'note_added'

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: UserRole
          is_active: boolean
          avatar_url: string | null
          legacy_mock_id: string | null
          locale: string
          timezone: string
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role: UserRole
          is_active?: boolean
          avatar_url?: string | null
          legacy_mock_id?: string | null
          locale?: string
          timezone?: string
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: UserRole
          is_active?: boolean
          avatar_url?: string | null
          legacy_mock_id?: string | null
          locale?: string
          timezone?: string
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          id: string
          legacy_mock_id: string | null
          name: string
          email: string
          phone: string | null
          company: string | null
          source: LeadSource
          status: LeadStatus
          score: number
          value: number
          assigned_to: string | null
          assignment_status: LeadAssignmentStatus
          locked_by_proposal_id: string | null
          locked_at: string | null
          released_at: string | null
          created_by: string
          notes: string | null
          tags: string[]
          last_contacted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          legacy_mock_id?: string | null
          name: string
          email: string
          phone?: string | null
          company?: string | null
          source: LeadSource
          status?: LeadStatus
          score: number
          value?: number
          assigned_to?: string | null
          assignment_status?: LeadAssignmentStatus
          locked_by_proposal_id?: string | null
          locked_at?: string | null
          released_at?: string | null
          created_by: string
          notes?: string | null
          tags?: string[]
          last_contacted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          legacy_mock_id?: string | null
          name?: string
          email?: string
          phone?: string | null
          company?: string | null
          source?: LeadSource
          status?: LeadStatus
          score?: number
          value?: number
          assigned_to?: string | null
          assignment_status?: LeadAssignmentStatus
          locked_by_proposal_id?: string | null
          locked_at?: string | null
          released_at?: string | null
          created_by?: string
          notes?: string | null
          tags?: string[]
          last_contacted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'leads_assigned_to_fkey'
            columns: ['assigned_to']
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'leads_created_by_fkey'
            columns: ['created_by']
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          }
        ]
      }
      lead_activities: {
        Row: {
          id: string
          lead_id: string
          activity_type: LeadActivityType
          actor_profile_id: string | null
          note_body: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          activity_type: LeadActivityType
          actor_profile_id?: string | null
          note_body?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          activity_type?: LeadActivityType
          actor_profile_id?: string | null
          note_body?: string | null
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'lead_activities_actor_profile_id_fkey'
            columns: ['actor_profile_id']
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'lead_activities_lead_id_fkey'
            columns: ['lead_id']
            referencedRelation: 'leads'
            referencedColumns: ['id']
          }
        ]
      }
      lead_proposals: {
        Row: {
          id: string
          lead_id: string
          created_by: string
          title: string
          body: string
          amount: number
          currency: string
          status: ProposalStatus
          sent_at: string | null
          accepted_at: string | null
          handoff_ready_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          created_by: string
          title: string
          body: string
          amount?: number
          currency?: string
          status?: ProposalStatus
          sent_at?: string | null
          accepted_at?: string | null
          handoff_ready_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          created_by?: string
          title?: string
          body?: string
          amount?: number
          currency?: string
          status?: ProposalStatus
          sent_at?: string | null
          accepted_at?: string | null
          handoff_ready_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'lead_proposals_created_by_fkey'
            columns: ['created_by']
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'lead_proposals_lead_id_fkey'
            columns: ['lead_id']
            referencedRelation: 'leads'
            referencedColumns: ['id']
          }
        ]
      }
      projects: {
        Row: {
          id: string
          source_lead_id: string | null
          source_proposal_id: string | null
          created_by: string
          name: string
          description: string | null
          client_name: string
          status: ProjectStatus
          budget: number
          pm_legacy_user_id: string | null
          team_legacy_user_ids: string[]
          handoff_ready_at: string | null
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          source_lead_id?: string | null
          source_proposal_id?: string | null
          created_by: string
          name: string
          description?: string | null
          client_name: string
          status?: ProjectStatus
          budget?: number
          pm_legacy_user_id?: string | null
          team_legacy_user_ids?: string[]
          handoff_ready_at?: string | null
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          source_lead_id?: string | null
          source_proposal_id?: string | null
          created_by?: string
          name?: string
          description?: string | null
          client_name?: string
          status?: ProjectStatus
          budget?: number
          pm_legacy_user_id?: string | null
          team_legacy_user_ids?: string[]
          handoff_ready_at?: string | null
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'projects_created_by_fkey'
            columns: ['created_by']
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'projects_source_lead_id_fkey'
            columns: ['source_lead_id']
            referencedRelation: 'leads'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'projects_source_proposal_id_fkey'
            columns: ['source_proposal_id']
            referencedRelation: 'lead_proposals'
            referencedColumns: ['id']
          }
        ]
      }
      tasks: {
        Row: {
          id: string
          project_id: string
          created_by: string
          title: string
          description: string | null
          status: TaskStatus
          priority: TaskPriority
          assigned_legacy_user_id: string | null
          due_date: string | null
          estimated_hours: number | null
          actual_hours: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          created_by: string
          title: string
          description?: string | null
          status?: TaskStatus
          priority?: TaskPriority
          assigned_legacy_user_id?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          created_by?: string
          title?: string
          description?: string | null
          status?: TaskStatus
          priority?: TaskPriority
          assigned_legacy_user_id?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tasks_assigned_legacy_user_id_fkey'
            columns: ['assigned_legacy_user_id']
            referencedRelation: 'user_profiles'
            referencedColumns: ['legacy_mock_id']
          },
          {
            foreignKeyName: 'tasks_created_by_fkey'
            columns: ['created_by']
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tasks_project_id_fkey'
            columns: ['project_id']
            referencedRelation: 'projects'
            referencedColumns: ['id']
          }
        ]
      }
      task_activities: {
        Row: {
          id: string
          task_id: string
          activity_type: TaskActivityType
          actor_profile_id: string | null
          note_body: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          activity_type: TaskActivityType
          actor_profile_id?: string | null
          note_body?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          activity_type?: TaskActivityType
          actor_profile_id?: string | null
          note_body?: string | null
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'task_activities_actor_profile_id_fkey'
            columns: ['actor_profile_id']
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'task_activities_task_id_fkey'
            columns: ['task_id']
            referencedRelation: 'tasks'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      claim_released_lead: {
        Args: {
          target_lead_id: string
        }
        Returns: string
      }
      release_lead_as_no_response: {
        Args: {
          target_lead_id: string
        }
        Returns: string
      }
    }
    Enums: {
      user_role: UserRole
      lead_status: LeadStatus
      lead_source: LeadSource
      lead_assignment_status: LeadAssignmentStatus
      lead_activity_type: LeadActivityType
      proposal_status: ProposalStatus
      project_status: ProjectStatus
      task_status: TaskStatus
      task_priority: TaskPriority
      task_activity_type: TaskActivityType
    }
    CompositeTypes: Record<string, never>
  }
}
