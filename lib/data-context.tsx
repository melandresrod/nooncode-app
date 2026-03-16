'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type {
  Lead,
  LeadDraft,
  LeadSource,
  LeadStatus,
  LeadUpdates,
  Project,
  ProjectDraft,
  ProjectStatus,
  ProjectUpdates,
  Reward,
  Task,
  TaskDraft,
  TaskStatus,
  TaskUpdates,
  User,
} from './types'
import { mockLeads, mockProjects, mockTasks, mockRewards, mockUsers } from './mock-data'

interface DataContextType {
  // Leads
  leads: Lead[]
  addLead: (lead: LeadDraft) => Lead
  updateLead: (id: string, updates: LeadUpdates) => void
  deleteLead: (id: string) => void
  updateLeadStatus: (id: string, status: LeadStatus) => void

  // Projects
  projects: Project[]
  addProject: (project: ProjectDraft) => Project
  updateProject: (id: string, updates: ProjectUpdates) => void
  deleteProject: (id: string) => void
  updateProjectStatus: (id: string, status: ProjectStatus) => void

  // Tasks
  tasks: Task[]
  addTask: (task: TaskDraft) => Task
  updateTask: (id: string, updates: TaskUpdates) => void
  deleteTask: (id: string) => void
  updateTaskStatus: (id: string, status: TaskStatus) => void
  getTasksByProject: (projectId: string) => Task[]

  // Rewards
  rewards: Reward[]
  redeemReward: (rewardId: string, userId: string) => boolean

  // Users
  users: User[]
  getUserById: (id: string) => User | undefined

  // Points
  userPoints: Record<string, number>
  addPoints: (userId: string, points: number, reason: string) => void
  deductPoints: (userId: string, points: number, reason: string) => boolean
  getPointsHistory: (userId: string) => PointsTransaction[]
}

interface PointsTransaction {
  id: string
  userId: string
  points: number
  type: 'earned' | 'redeemed'
  reason: string
  timestamp: Date
}

const DataContext = createContext<DataContextType | undefined>(undefined)

function normalizeLeadSource(source: LeadDraft['source']): LeadSource {
  if (source === 'social_media') return 'social'
  if (source === 'cold_outreach') return 'cold_call'
  return source
}

function normalizeTaskAssignment(taskData: Pick<TaskDraft, 'assignedTo' | 'assignedToName' | 'assigneeId' | 'assigneeName'>) {
  return {
    assignedTo: taskData.assignedTo ?? taskData.assigneeId,
    assignedToName: taskData.assignedToName ?? taskData.assigneeName,
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(mockLeads)
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [rewards] = useState<Reward[]>(mockRewards)
  const [users] = useState<User[]>(mockUsers)
  const [userPoints, setUserPoints] = useState<Record<string, number>>(() => {
    const points: Record<string, number> = {}
    mockUsers.forEach((u) => {
      points[u.id] = u.points
    })
    return points
  })
  const [pointsHistory, setPointsHistory] = useState<PointsTransaction[]>([])

  // Lead operations
  const addLead = useCallback((leadData: LeadDraft) => {
    const newLead: Lead = {
      ...leadData,
      source: normalizeLeadSource(leadData.source),
      id: `lead-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setLeads((prev) => [newLead, ...prev])
    return newLead
  }, [])

  const updateLead = useCallback((id: string, updates: LeadUpdates) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id
          ? {
              ...lead,
              ...updates,
              source: updates.source ? normalizeLeadSource(updates.source) : lead.source,
              updatedAt: new Date(),
            }
          : lead
      )
    )
  }, [])

  const deleteLead = useCallback((id: string) => {
    setLeads((prev) => prev.filter((lead) => lead.id !== id))
  }, [])

  const updateLeadStatus = useCallback((id: string, status: LeadStatus) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id ? { ...lead, status, updatedAt: new Date() } : lead
      )
    )
  }, [])

  // Project operations
  const addProject = useCallback((projectData: ProjectDraft) => {
    const newProject: Project = {
      ...projectData,
      id: `project-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setProjects((prev) => [newProject, ...prev])
    return newProject
  }, [])

  const updateProject = useCallback((id: string, updates: ProjectUpdates) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === id
          ? {
              ...project,
              ...updates,
              clientId: updates.clientId ?? project.clientId,
              updatedAt: new Date(),
            }
          : project
      )
    )
  }, [])

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((project) => project.id !== id))
    setTasks((prev) => prev.filter((task) => task.projectId !== id))
  }, [])

  const updateProjectStatus = useCallback((id: string, status: ProjectStatus) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === id ? { ...project, status, updatedAt: new Date() } : project
      )
    )
  }, [])

  // Task operations
  const addTask = useCallback((taskData: TaskDraft) => {
    const normalizedTask = normalizeTaskAssignment(taskData)
    const newTask: Task = {
      projectId: taskData.projectId,
      title: taskData.title,
      description: taskData.description,
      status: taskData.status,
      priority: taskData.priority,
      ...normalizedTask,
      dueDate: taskData.dueDate,
      estimatedHours: taskData.estimatedHours,
      actualHours: taskData.actualHours,
      id: `task-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setTasks((prev) => [newTask, ...prev])
    return newTask
  }, [])

  const updateTask = useCallback((id: string, updates: TaskUpdates) => {
    const normalizedAssignment = normalizeTaskAssignment(updates)

    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              projectId: updates.projectId ?? task.projectId,
              title: updates.title ?? task.title,
              status: updates.status ?? task.status,
              priority: updates.priority ?? task.priority,
              description: updates.description ?? task.description,
              dueDate: updates.dueDate ?? task.dueDate,
              estimatedHours: updates.estimatedHours ?? task.estimatedHours,
              actualHours: updates.actualHours ?? task.actualHours,
              assignedTo: normalizedAssignment.assignedTo ?? task.assignedTo,
              assignedToName: normalizedAssignment.assignedToName ?? task.assignedToName,
              updatedAt: new Date(),
            }
          : task
      )
    )
  }, [])

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }, [])

  const updateTaskStatus = useCallback((id: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, status, updatedAt: new Date() } : task
      )
    )
  }, [])

  const getTasksByProject = useCallback(
    (projectId: string) => {
      return tasks.filter((task) => task.projectId === projectId)
    },
    [tasks]
  )

  // User operations
  const getUserById = useCallback(
    (id: string) => {
      return users.find((u) => u.id === id)
    },
    [users]
  )

  // Points operations
  const addPoints = useCallback((userId: string, points: number, reason: string) => {
    setUserPoints((prev) => ({
      ...prev,
      [userId]: (prev[userId] || 0) + points,
    }))
    setPointsHistory((prev) => [
      {
        id: `tx-${Date.now()}`,
        userId,
        points,
        type: 'earned',
        reason,
        timestamp: new Date(),
      },
      ...prev,
    ])
  }, [])

  const deductPoints = useCallback(
    (userId: string, points: number, reason: string) => {
      const currentPoints = userPoints[userId] || 0
      if (currentPoints < points) return false

      setUserPoints((prev) => ({
        ...prev,
        [userId]: prev[userId] - points,
      }))
      setPointsHistory((prev) => [
        {
          id: `tx-${Date.now()}`,
          userId,
          points,
          type: 'redeemed',
          reason,
          timestamp: new Date(),
        },
        ...prev,
      ])
      return true
    },
    [userPoints]
  )

  const getPointsHistory = useCallback(
    (userId: string) => {
      return pointsHistory.filter((tx) => tx.userId === userId)
    },
    [pointsHistory]
  )

  // Rewards
  const redeemReward = useCallback(
    (rewardId: string, userId: string) => {
      const reward = rewards.find((r) => r.id === rewardId)
      if (!reward || !reward.available) return false

      const success = deductPoints(userId, reward.pointsCost, `Canje: ${reward.name}`)
      return success
    },
    [rewards, deductPoints]
  )

  return (
    <DataContext.Provider
      value={{
        leads,
        addLead,
        updateLead,
        deleteLead,
        updateLeadStatus,
        projects,
        addProject,
        updateProject,
        deleteProject,
        updateProjectStatus,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
        getTasksByProject,
        rewards,
        redeemReward,
        users,
        getUserById,
        userPoints,
        addPoints,
        deductPoints,
        getPointsHistory,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
