'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth, canManageTeam } from '@/lib/auth-context'
import { useData } from '@/lib/data-context'
import type { DeliveryUser, Project, ProjectStatus, ProjectTaskActivity, Task } from '@/lib/types'
import { calculateProjectProgress, deriveProjectDisplayStatus } from '@/lib/projects/progress'
import { ProjectFormDialog } from '@/components/project-form-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  FolderKanban,
  Clock,
  AlertTriangle,
  Users,
  Calendar,
  DollarSign,
  MessageSquareText,
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

function getProjectPmName(project: Project, deliveryUsers: DeliveryUser[]) {
  if (project.pmName) {
    return project.pmName
  }

  if (!project.pmId) {
    return undefined
  }

  return deliveryUsers.find((user) => user.id === project.pmId)?.name
}

export default function ProjectsPage() {
  const { user } = useAuth()
  const {
    projectBoardProjects,
    deliveryUsers,
    getTasksByProject,
    getProjectActivity,
    updateProjectStatus,
  } = useData()
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')

  if (!user) return null

  const canManageProjects = canManageTeam(user.role)
  const visibleProjects = projectBoardProjects

  const getProjectsByStatus = (status: ProjectStatus) => {
    return visibleProjects.filter((project) => {
      const tasks = getTasksByProject(project.id)
      return deriveProjectDisplayStatus(project.status, tasks) === status
    })
  }

  const getProjectProgress = (projectId: string) => {
    return calculateProjectProgress(getTasksByProject(projectId))
  }

  const handleStatusChange = async (projectId: string, newStatus: ProjectStatus) => {
    try {
      await updateProjectStatus(projectId, newStatus)
      toast.success(`Proyecto actualizado a "${statusConfig[newStatus].label}"`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo actualizar el proyecto')
    }
  }

  const selectedProject = useMemo(
    () => visibleProjects.find((project) => project.id === selectedProjectId) ?? null,
    [visibleProjects, selectedProjectId]
  )

  // Stats
  const totalProjects = visibleProjects.length
  const activeProjects = visibleProjects.filter((project) => {
    const tasks = getTasksByProject(project.id)
    return deriveProjectDisplayStatus(project.status, tasks) === 'in_progress'
  }).length
  const inReview = visibleProjects.filter((project) => {
    const tasks = getTasksByProject(project.id)
    return deriveProjectDisplayStatus(project.status, tasks) === 'review'
  }).length
  const totalBudget = visibleProjects.reduce((sum, p) => sum + p.budget, 0)

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-balance">Proyectos</h1>
          <p className="text-muted-foreground max-w-2xl">
            {canManageProjects ? 'Gestiona todos los proyectos del equipo' : 'Proyectos donde colaboras'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
            <TabsList>
              <TabsTrigger value="kanban">Kanban</TabsTrigger>
              <TabsTrigger value="list">Lista</TabsTrigger>
            </TabsList>
          </Tabs>
          {canManageProjects && (
            <Button variant="outline" disabled>
              <Plus className="size-4 mr-2" />
              Nuevo Proyecto desde Hand-off
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
                            deliveryUsers={deliveryUsers}
                            progress={getProjectProgress(project.id)}
                            taskCount={getTasksByProject(project.id).length}
                            pmName={getProjectPmName(project, deliveryUsers)}
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
          {visibleProjects.length === 0 ? (
            <Card className="p-12">
              <Empty className="border-0 p-0">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <FolderKanban className="size-5" />
                  </EmptyMedia>
                  <EmptyTitle>No hay proyectos para mostrar</EmptyTitle>
                  <EmptyDescription>
                    {canManageProjects
                      ? 'Los proyectos creados apareceran aqui.'
                      : 'Apareceran aqui cuando formes parte del equipo o tengas tareas asignadas.'}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </Card>
          ) : (
            visibleProjects.map((project) => (
              <Card
                key={project.id}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedProjectId(project.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{project.name}</h3>
                      <Badge
                        variant="outline"
                        className={statusConfig[deriveProjectDisplayStatus(project.status, getTasksByProject(project.id))].color}
                      >
                        {statusConfig[deriveProjectDisplayStatus(project.status, getTasksByProject(project.id))].label}
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
              deliveryUsers={deliveryUsers}
              getProjectActivity={getProjectActivity}
              onStatusChange={handleStatusChange}
              canManageProjects={canManageProjects}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ProjectCardProps {
  project: Project
  deliveryUsers: DeliveryUser[]
  progress: number
  taskCount: number
  pmName?: string
  onClick: () => void
}

function ProjectCard({ project, deliveryUsers, progress, taskCount, pmName, onClick }: ProjectCardProps) {
  const teamMembers = project.teamIds
    .map((id) => deliveryUsers.find((user) => user.id === id))
    .filter((member): member is DeliveryUser => Boolean(member))

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

          {(teamMembers.length > 0 || pmName) && (
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
              {pmName && (
                <span className="text-xs text-muted-foreground">PM: {pmName.split(' ')[0]}</span>
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
  deliveryUsers: DeliveryUser[]
  getProjectActivity: (projectId: string) => Promise<ProjectTaskActivity[]>
  onStatusChange: (projectId: string, newStatus: ProjectStatus) => Promise<void>
  canManageProjects: boolean
}

function ProjectDetail({
  project,
  tasks,
  deliveryUsers,
  getProjectActivity,
  onStatusChange,
  canManageProjects,
}: ProjectDetailProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const completedTasks = tasks.filter((t) => t.status === 'done').length
  const progress = calculateProjectProgress(tasks)
  const displayStatus = deriveProjectDisplayStatus(project.status, tasks)
  const teamMembers = project.teamIds
    .map((id) => deliveryUsers.find((user) => user.id === id))
    .filter((member): member is DeliveryUser => Boolean(member))
  const pmName = getProjectPmName(project, deliveryUsers)

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
        <Badge variant="outline" className={statusConfig[displayStatus].color}>
          {statusConfig[displayStatus].label}
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
          <p className="text-xs text-muted-foreground">Fecha inicio</p>
          <p className="text-lg font-bold">
            {project.startDate?.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }) || '-'}
          </p>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">Fecha fin</p>
          <p className="text-lg font-bold">
            {project.endDate?.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }) || '-'}
          </p>
        </div>
      </div>

      {project.description && (
        <div className="rounded-lg bg-muted/40 p-4">
          <p className="text-xs text-muted-foreground mb-1">Descripcion</p>
          <p className="text-sm">{project.description}</p>
        </div>
      )}

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
          {pmName && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
              <Avatar className="size-6">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {pmName.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{pmName}</span>
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
          {!pmName && teamMembers.length === 0 && (
            <div className="rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground">
              Sin PM ni equipo asignado.
            </div>
          )}
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

      {canManageProjects && (
        <ProjectActivityTimeline
          projectId={project.id}
          getProjectActivity={getProjectActivity}
        />
      )}

      {/* Actions */}
      {canManageProjects && (
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setIsEditOpen(true)}>
            Editar Proyecto
          </Button>
          {project.status !== 'completed' && (
            <>
              {displayStatus === 'backlog' && (
                <Button onClick={() => onStatusChange(project.id, 'in_progress')}>
                  Iniciar Proyecto
                </Button>
              )}
              {displayStatus === 'in_progress' && (
                <Button onClick={() => onStatusChange(project.id, 'review')}>
                  Enviar a Revision
                </Button>
              )}
              {displayStatus === 'review' && (
                <Button onClick={() => onStatusChange(project.id, 'delivered')}>
                  Marcar Entregado
                </Button>
              )}
              {displayStatus === 'delivered' && (
                <Button onClick={() => onStatusChange(project.id, 'completed')}>
                  Completar Proyecto
                </Button>
              )}
            </>
          )}
          <Button variant="outline">Ver Tareas Detalle</Button>
        </div>
      )}

      <ProjectFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        editProject={project}
      />
    </div>
  )
}

interface ProjectActivityTimelineProps {
  projectId: string
  getProjectActivity: (projectId: string) => Promise<ProjectTaskActivity[]>
}

function ProjectActivityTimeline({
  projectId,
  getProjectActivity,
}: ProjectActivityTimelineProps) {
  const [activities, setActivities] = useState<ProjectTaskActivity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    let isActive = true

    const loadProjectActivity = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const nextActivities = await getProjectActivity(projectId)

        if (!isActive) {
          return
        }

        setActivities(nextActivities)
      } catch (error) {
        if (!isActive) {
          return
        }

        setActivities([])
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'No se pudo cargar el historial del proyecto.'
        )
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadProjectActivity()

    return () => {
      isActive = false
    }
  }, [getProjectActivity, projectId, reloadCount])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MessageSquareText className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Historial de actividad</h3>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="rounded-lg border bg-muted/10 p-4 space-y-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      ) : errorMessage ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col gap-3 p-4">
            <div>
              <p className="text-sm font-medium text-destructive">No se pudo cargar el historial.</p>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
            </div>
            <div>
              <Button variant="outline" size="sm" onClick={() => setReloadCount((count) => count + 1)}>
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : activities.length === 0 ? (
        <Card className="p-6">
          <Empty className="border-0 p-0">
            <EmptyHeader className="gap-2">
              <EmptyMedia variant="icon">
                <MessageSquareText className="size-5" />
              </EmptyMedia>
              <EmptyTitle>Aun no hay actividad</EmptyTitle>
              <EmptyDescription>
                Las notas de avance de las tareas de este proyecto apareceran aqui.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </Card>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="rounded-lg border bg-muted/20 p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{activity.taskTitle}</p>
                  <p className="text-xs text-muted-foreground">{activity.actorName}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {activity.createdAt.toLocaleString('es-MX')}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{activity.noteBody ?? ''}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
