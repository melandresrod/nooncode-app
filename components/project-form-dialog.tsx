'use client'

import React from "react"

import { useState } from 'react'
import { useData } from '@/lib/data-context'
import type { ProjectDraft, ProjectStatus, ProjectUpdates } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface ProjectFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editProject?: {
    id: string
    name: string
    clientName: string
    budget: number
    description?: string
    status: ProjectStatus
  }
}

interface ProjectFormState {
  name: string
  clientName: string
  budget: string
  description: string
  pmId: string
  teamIds: string[]
  startDate: string
  endDate: string
}

function createEmptyFormData(): ProjectFormState {
  return {
    name: '',
    clientName: '',
    budget: '',
    description: '',
    pmId: '',
    teamIds: [],
    startDate: '',
    endDate: '',
  }
}

export function ProjectFormDialog({ open, onOpenChange, editProject }: ProjectFormDialogProps) {
  const { addProject, updateProject, users } = useData()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const pms = users.filter((u) => u.role === 'pm' || u.role === 'admin')
  const devs = users.filter((u) => u.role === 'developer')

  const [formData, setFormData] = useState<ProjectFormState>({
    name: editProject?.name || '',
    clientName: editProject?.clientName || '',
    budget: editProject?.budget?.toString() || '',
    description: editProject?.description || '',
    pmId: '',
    teamIds: [] as string[],
    startDate: '',
    endDate: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const pm = pms.find((p) => p.id === formData.pmId)

      const projectData: ProjectDraft = {
        name: formData.name,
        clientName: formData.clientName,
        budget: Number.parseFloat(formData.budget) || 0,
        description: formData.description || undefined,
        status: (editProject?.status || 'backlog') as ProjectStatus,
        pmId: formData.pmId || undefined,
        pmName: pm?.name,
        teamIds: formData.teamIds,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      }

      if (editProject) {
        const projectUpdates: ProjectUpdates = projectData
        updateProject(editProject.id, projectUpdates)
        toast.success('Proyecto actualizado correctamente')
      } else {
        addProject(projectData)
        toast.success('Proyecto creado correctamente')
      }

      onOpenChange(false)
      setFormData(createEmptyFormData())
    } catch (error) {
      toast.error('Error al guardar el proyecto')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleTeamMember = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      teamIds: prev.teamIds.includes(userId)
        ? prev.teamIds.filter((id) => id !== userId)
        : [...prev.teamIds, userId],
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{editProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}</DialogTitle>
          <DialogDescription>
            {editProject
              ? 'Actualiza la informacion del proyecto'
              : 'Configura un nuevo proyecto para el equipo'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Proyecto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Rediseno sitio web"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientName">Cliente *</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => setFormData((prev) => ({ ...prev, clientName: e.target.value }))}
                placeholder="Empresa SA"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Presupuesto ($)</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData((prev) => ({ ...prev, budget: e.target.value }))}
                placeholder="25000"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pm">Project Manager</Label>
              <Select
                value={formData.pmId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, pmId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar PM" />
                </SelectTrigger>
                <SelectContent>
                  {pms.map((pm) => (
                    <SelectItem key={pm.id} value={pm.id}>
                      {pm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha inicio</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha fin estimada</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Equipo de Desarrollo</Label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-[60px]">
              {devs.map((dev) => (
                <Button
                  key={dev.id}
                  type="button"
                  variant={formData.teamIds.includes(dev.id) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleTeamMember(dev.id)}
                >
                  {dev.name}
                </Button>
              ))}
              {devs.length === 0 && (
                <p className="text-sm text-muted-foreground">No hay desarrolladores disponibles</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripcion</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Descripcion del alcance y objetivos..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : editProject ? 'Actualizar' : 'Crear Proyecto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
