'use client'

import { useMemo, useState } from 'react'
import { useAuth, canManageTeam } from '@/lib/auth-context'
import { useData } from '@/lib/data-context'
import type { Project, ProjectStatus, Task } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import {
  FolderKanban,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Calendar,
  DollarSign,
  Plus,
  ArrowRight,
} from 'lucide-react'

const projectStages: { status: ProjectStatus; label: string; color: string }[] = [
  { status: 'backlog', label: 'Backlog', color: 'bg-slate-500' },
  { status: 'in_progress', label: 'En Progreso', color: 'bg-blue-500' },
  { status: 'review', label: 'Revision', color: 'bg-amber-500' },
  { status: 'delivered', label: 'Entregado', color: 'bg-primary' },
  { status: 'completed', label: 'Completado', color: 'bg-emerald-500' },
]

const statusConfig: Record<ProjectStatus, { label: string; color: string }> = {
  backlog: { label: 'Backlog', color: 'bg-slate-500/10 text-slate-700' },
  in_progress: { label: 'En Progreso', color: 'bg-blue-500/10 text-blue-700' },
  review: { label: 'Revision', color: 'bg-amber-500/10 text-amber-700' },
  delivered: { label: 'Entregado', color: 'bg-primary/10 text-primary' },
  completed: { label: 'Completado', color: 'bg-emerald-500/10 text-emerald-700' },
}

export default function ProjectsPage() {
  const { user } = useAuth()
  const { projects, users, getTasksByProject, updateProjectStatus } = useData()
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')

  if (!user) return null

  const isPM = canManageTeam(user.role)
  const filteredProjects = isPM
    ? projects
    : projects.filter((p) => p.teamIds.includes(user.id))

  const getProjectsByStatus = (status: ProjectStatus) => {
    return filteredProjects.filter((p) => p.status === status)
  }

  const getProjectProgress = (projectId: string) => {
    const tasks = getTasksByProject(projectId)
    if (tasks.length === 0) return 0
    const completed = tasks.filter((t) => t.status === 'done').length
    return Math.round((completed / tasks.length) * 100)
  }

  const handleStatusChange = (projectId: string, newStatus: ProjectStatus) => {
    updateProjectStatus(projectId, newStatus)
  }

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  )

  // Stats
  const totalProjects = filteredProjects.length
  const activeProjects = filteredProjects.filter((p) => p.status === 'in_progress').length
  const inReview = filteredProjects.filter((p) => p.status === 'review').length
  const totalBudget = filteredProjects.reduce((sum, p) => sum + p.budget, 0)

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-balance">Proyectos</h1>
          <p className="text-muted-foreground max-w-2xl">
            {isPM ? 'Gestiona todos los proyectos del equipo' : 'Tus proyectos asignados'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
            <TabsList>
              <TabsTrigger value="kanban">Kanban</TabsTrigger>
              <TabsTrigger value="list">Lista</TabsTrigger>
            </TabsList>
          </Tabs>
          {isPM && (
            <Button>
              <Plus className="size-4 mr-2" />
              Nuevo Proyecto
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Proyectos</CardTitle>
            <FolderKanban className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Revision</CardTitle>
            <AlertTriangle className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inReview}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presupuesto Total</CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="flex gap-4 pb-4" style={{ minWidth: 'max-content' }}>
            {projectStages.map((stage) => {
              const stageProjects = getProjectsByStatus(stage.status)

              return (
                <div key={stage.status} className="w-[320px] shrink-0">
                  <Card className="h-full flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <div className={cn('size-3 rounded-full', stage.color)} />
                        <CardTitle className="text-sm font-medium">{stage.label}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {stageProjects.length}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 pt-0">
                      <div className="space-y-3 min-h-[200px]">
                        {stageProjects.map((project) => (
                          <ProjectCard
                            key={project.id}
                            project={project}
                            users={users}
                            progress={getProjectProgress(project.id)}
                            taskCount={getTasksByProject(project.id).length}
                            onClick={() => setSelectedProjectId(project.id)}
                          />
                        ))}
                        {stageProjects.length === 0 && (
                          <Empty className="min-h-[120px] gap-3 rounded-lg border-2 p-4">
                            <EmptyHeader className="gap-1">
                              <EmptyMedia variant="icon">
                                <FolderKanban className="size-5" />
                              </EmptyMedia>
                              <EmptyTitle className="text-sm">Sin proyectos</EmptyTitle>
                              <EmptyDescription className="text-xs">
                                No hay elementos en esta etapa por ahora.
                              </EmptyDescription>
                            </EmptyHeader>
                          </Empty>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredProjects.length === 0 ? (
            <Card className="p-12">
              <Empty className="border-0 p-0">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <FolderKanban className="size-5" />
                  </EmptyMedia>
                  <EmptyTitle>No hay proyectos para mostrar</EmptyTitle>
                  <EmptyDescription>
                    {isPM
                      ? 'Los proyectos creados apareceran aqui.'
                      : 'Cuando te asignen proyectos, los veras en esta lista.'}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </Card>
          ) : (
            filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedProjectId(project.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{project.name}</h3>
                      <Badge variant="outline" className={statusConfig[project.status].color}>
                        {statusConfig[project.status].label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{project.clientName}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-medium">${project.budget.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Presupuesto</p>
                    </div>
                    <div className="w-24">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>Progreso</span>
                        <span>{getProjectProgress(project.id)}%</span>
                      </div>
                      <Progress value={getProjectProgress(project.id)} className="h-2" />
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Project Detail Dialog */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProjectId(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del Proyecto</DialogTitle>
            <DialogDescription>
              Informacion completa y tareas del proyecto
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <ProjectDetail
              project={selectedProject}
              tasks={getTasksByProject(selectedProject.id)}
              users={users}
              onStatusChange={handleStatusChange}
              isPM={isPM}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ProjectCardProps {
  project: Project
  users: { id: string; name: string }[]
  progress: number
  taskCount: number
  onClick: () => void
}

function ProjectCard({ project, users, progress, taskCount, onClick }: ProjectCardProps) {
  const teamMembers = project.teamIds.map((id) => users.find((u) => u.id === id)).filter(Boolean)

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-sm line-clamp-1">{project.name}</h4>
            <p className="text-xs text-muted-foreground">{project.clientName}</p>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="size-3" />
              {project.endDate
                ? project.endDate.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })
                : 'Sin fecha'}
            </div>
            <div className="flex items-center gap-1 font-medium text-primary">
              <DollarSign className="size-3" />
              {project.budget.toLocaleString()}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">{taskCount} tareas</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>

          {teamMembers.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                {teamMembers.slice(0, 3).map((member) => (
                  <Avatar key={member?.id} className="size-6 border-2 border-background">
                    <AvatarFallback className="text-xs bg-muted">
                      {member?.name.split(' ').map((n) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {teamMembers.length > 3 && (
                  <div className="size-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                    +{teamMembers.length - 3}
                  </div>
                )}
              </div>
              {project.pmName && (
                <span className="text-xs text-muted-foreground">PM: {project.pmName.split(' ')[0]}</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface ProjectDetailProps {
  project: Project
  tasks: Task[]
  users: { id: string; name: string }[]
  onStatusChange: (projectId: string, newStatus: ProjectStatus) => void
  isPM: boolean
}

function ProjectDetail({ project, tasks, users, onStatusChange, isPM }: ProjectDetailProps) {
  const completedTasks = tasks.filter((t) => t.status === 'done').length
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0
  const teamMembers = project.teamIds.map((id) => users.find((u) => u.id === id)).filter(Boolean)

  const tasksByStatus = {
    todo: tasks.filter((t) => t.status === 'todo'),
    in_progress: tasks.filter((t) => t.status === 'in_progress'),
    review: tasks.filter((t) => t.status === 'review'),
    done: tasks.filter((t) => t.status === 'done'),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold">{project.name}</h2>
          <p className="text-muted-foreground">{project.clientName}</p>
        </div>
        <Badge variant="outline" className={statusConfig[project.status].color}>
          {statusConfig[project.status].label}
        </Badge>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">Presupuesto</p>
          <p className="text-lg font-bold">${project.budget.toLocaleString()}</p>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">Progreso</p>
          <p className="text-lg font-bold">{progress}%</p>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">Tareas</p>
          <p className="text-lg font-bold">{completedTasks}/{tasks.length}</p>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">Fecha fin</p>
          <p className="text-lg font-bold">
            {project.endDate?.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }) || '-'}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-sm mb-2">
          <span>Progreso general</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      {/* Team */}
      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Users className="size-4" />
          Equipo
        </h3>
        <div className="flex flex-wrap gap-2">
          {project.pmName && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
              <Avatar className="size-6">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {project.pmName.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{project.pmName}</span>
              <Badge variant="secondary" className="text-xs">PM</Badge>
            </div>
          )}
          {teamMembers.map((member) => (
            <div key={member?.id} className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
              <Avatar className="size-6">
                <AvatarFallback className="text-xs">
                  {member?.name.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{member?.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks by Status */}
      <div>
        <h3 className="text-sm font-medium mb-3">Tareas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { key: 'todo', label: 'Por hacer', color: 'border-slate-300' },
            { key: 'in_progress', label: 'En progreso', color: 'border-blue-400' },
            { key: 'review', label: 'Revision', color: 'border-yellow-400' },
            { key: 'done', label: 'Completadas', color: 'border-green-400' },
          ].map(({ key, label, color }) => (
            <div key={key} className={cn('p-3 rounded-lg border-l-4', color, 'bg-muted/30')}>
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className="text-xl font-bold">{tasksByStatus[key as keyof typeof tasksByStatus].length}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {isPM && (
        <div className="flex gap-2 pt-4 border-t">
          {project.status !== 'completed' && (
            <>
              {project.status === 'backlog' && (
                <Button onClick={() => onStatusChange(project.id, 'in_progress')}>
                  Iniciar Proyecto
                </Button>
              )}
              {project.status === 'in_progress' && (
                <Button onClick={() => onStatusChange(project.id, 'review')}>
                  Enviar a Revision
                </Button>
              )}
              {project.status === 'review' && (
                <Button onClick={() => onStatusChange(project.id, 'delivered')}>
                  Marcar Entregado
                </Button>
              )}
              {project.status === 'delivered' && (
                <Button onClick={() => onStatusChange(project.id, 'completed')}>
                  Completar Proyecto
                </Button>
              )}
            </>
          )}
          <Button variant="outline">Ver Tareas Detalle</Button>
        </div>
      )}
    </div>
  )
}
