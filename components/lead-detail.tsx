'use client'

import { useEffect, useState } from 'react'
import { useData } from '@/lib/data-context'
import type { Lead, LeadActivity, LeadProposal, LeadStatus, ProposalStatus } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Building2,
  Mail,
  Phone,
  Calendar,
  Clock,
  Tag,
  MessageSquare,
  FileText,
  Sparkles,
  Send,
  Copy,
  CheckCircle2,
  History,
  Loader2,
  ArrowRightLeft,
  FolderKanban,
} from 'lucide-react'

interface LeadDetailProps {
  lead: Lead
  onStatusChange: (leadId: string, newStatus: LeadStatus) => Promise<Lead> | void
}

const statusConfig: Record<LeadStatus, { label: string; color: string }> = {
  new: { label: 'Nuevo', color: 'bg-blue-500/10 text-blue-700' },
  contacted: { label: 'Contactado', color: 'bg-amber-500/10 text-amber-700' },
  qualified: { label: 'Calificado', color: 'bg-primary/10 text-primary' },
  proposal: { label: 'Propuesta', color: 'bg-orange-500/10 text-orange-700' },
  negotiation: { label: 'Negociacion', color: 'bg-accent/10 text-accent' },
  won: { label: 'Ganado', color: 'bg-emerald-500/10 text-emerald-700' },
  lost: { label: 'Perdido', color: 'bg-red-500/10 text-red-700' },
}

const sourceLabels: Record<string, string> = {
  website: 'Sitio Web',
  referral: 'Referido',
  cold_call: 'Llamada Fria',
  social: 'Redes Sociales',
  event: 'Evento',
  other: 'Otro',
}

const leadFieldLabels: Record<string, string> = {
  name: 'nombre',
  email: 'email',
  phone: 'telefono',
  company: 'empresa',
  source: 'origen',
  score: 'score',
  value: 'valor',
  assignedTo: 'asignacion',
  notes: 'notas base',
  tags: 'tags',
  lastContactedAt: 'ultimo contacto',
}

const proposalStatusConfig: Record<ProposalStatus, { label: string; color: string }> = {
  draft: { label: 'Borrador', color: 'bg-slate-500/10 text-slate-700' },
  sent: { label: 'Enviada', color: 'bg-blue-500/10 text-blue-700' },
  accepted: { label: 'Aceptada', color: 'bg-emerald-500/10 text-emerald-700' },
  rejected: { label: 'Rechazada', color: 'bg-red-500/10 text-red-700' },
  handoff_ready: { label: 'Lista para hand-off', color: 'bg-primary/10 text-primary' },
}

function buildDefaultProposalTitle(lead: Lead) {
  return `Propuesta - ${lead.company || lead.name}`
}

function getChangedFields(metadata: LeadActivity['metadata']): string[] {
  const changedFields = metadata?.changedFields

  if (!Array.isArray(changedFields)) {
    return []
  }

  return changedFields.filter((value): value is string => typeof value === 'string')
}

function getStatusTransition(metadata: LeadActivity['metadata']) {
  const fromStatus = metadata?.fromStatus
  const toStatus = metadata?.toStatus

  return {
    fromStatus: typeof fromStatus === 'string' ? (fromStatus as LeadStatus) : null,
    toStatus: typeof toStatus === 'string' ? (toStatus as LeadStatus) : null,
  }
}

function getProposalStatusTransition(metadata: LeadActivity['metadata']) {
  const fromStatus = metadata?.fromStatus
  const toStatus = metadata?.toStatus

  return {
    fromStatus: typeof fromStatus === 'string' ? (fromStatus as ProposalStatus) : null,
    toStatus: typeof toStatus === 'string' ? (toStatus as ProposalStatus) : null,
  }
}

function formatActivityTitle(activity: LeadActivity) {
  if (activity.type === 'created') {
    return 'Lead creado'
  }

  if (activity.type === 'note_added') {
    return 'Nota agregada'
  }

  if (activity.type === 'status_changed') {
    const { fromStatus, toStatus } = getStatusTransition(activity.metadata)
    const fromLabel = fromStatus ? statusConfig[fromStatus].label : 'Sin estado'
    const toLabel = toStatus ? statusConfig[toStatus].label : 'Actualizado'
    return `Estado: ${fromLabel} -> ${toLabel}`
  }

  if (activity.type === 'proposal_created') {
    const title = typeof activity.metadata?.title === 'string' ? activity.metadata.title : 'Sin titulo'
    return `Propuesta creada: ${title}`
  }

  if (activity.type === 'proposal_status_changed') {
    const { fromStatus, toStatus } = getProposalStatusTransition(activity.metadata)
    const fromLabel = fromStatus ? proposalStatusConfig[fromStatus].label : 'Sin estado'
    const toLabel = toStatus ? proposalStatusConfig[toStatus].label : 'Actualizado'
    return `Propuesta: ${fromLabel} -> ${toLabel}`
  }

  if (activity.type === 'project_created') {
    const projectName = typeof activity.metadata?.projectName === 'string'
      ? activity.metadata.projectName
      : 'Sin nombre'
    return `Proyecto creado: ${projectName}`
  }

  const changedFields = getChangedFields(activity.metadata)

  if (changedFields.length === 0) {
    return 'Lead actualizado'
  }

  const label = changedFields
    .map((field) => leadFieldLabels[field] ?? field)
    .join(', ')

  return `Actualizacion: ${label}`
}

function formatActivityBody(activity: LeadActivity) {
  if (activity.type === 'note_added') {
    return activity.noteBody ?? ''
  }

  if (activity.type === 'created') {
    return 'El lead quedo registrado en el pipeline persistente.'
  }

  if (activity.type === 'status_changed') {
    return `Movimiento registrado por ${activity.actorName}.`
  }

  if (activity.type === 'proposal_created') {
    return 'La propuesta comercial quedo vinculada al lead y lista para seguimiento.'
  }

  if (activity.type === 'proposal_status_changed') {
    return `Cambio de propuesta registrado por ${activity.actorName}.`
  }

  if (activity.type === 'project_created') {
    return 'El hand-off comercial se convirtio en un proyecto persistente para delivery.'
  }

  const changedFields = getChangedFields(activity.metadata)

  if (changedFields.length === 0) {
    return 'Se actualizaron datos del lead.'
  }

  return `Campos tocados: ${changedFields
    .map((field) => leadFieldLabels[field] ?? field)
    .join(', ')}.`
}

function isValidLeadEmail(email: string | undefined): boolean {
  if (!email) {
    return false
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function buildGmailComposeUrl(email: string): string {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: email,
  })

  return `https://mail.google.com/mail/?${params.toString()}`
}

export function LeadDetail({ lead, onStatusChange }: LeadDetailProps) {
  const {
    getLeadActivity,
    addLeadNote,
    getLeadProposals,
    addLeadProposal,
    updateLeadProposalStatus,
    createProjectFromProposal,
    projects,
  } = useData()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [noteText, setNoteText] = useState('')
  const [activities, setActivities] = useState<LeadActivity[]>([])
  const [proposals, setProposals] = useState<LeadProposal[]>([])
  const [isActivityLoading, setIsActivityLoading] = useState(true)
  const [isProposalsLoading, setIsProposalsLoading] = useState(true)
  const [isSavingNote, setIsSavingNote] = useState(false)
  const [isSavingProposal, setIsSavingProposal] = useState(false)
  const [creatingProjectProposalId, setCreatingProjectProposalId] = useState<string | null>(null)
  const [proposalForm, setProposalForm] = useState({
    title: buildDefaultProposalTitle(lead),
    amount: lead.value.toString(),
    body: '',
  })
  const hasValidEmail = isValidLeadEmail(lead.email)
  const gmailComposeUrl = hasValidEmail ? buildGmailComposeUrl(lead.email) : null
  const projectByProposalId = new Map(
    projects
      .filter((project) => project.sourceProposalId)
      .map((project) => [project.sourceProposalId as string, project])
  )

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-500/10'
    if (score >= 60) return 'text-amber-700 bg-amber-500/10'
    if (score >= 40) return 'text-orange-700 bg-orange-500/10'
    return 'text-red-700 bg-red-500/10'
  }

  const handleGenerateEmail = async () => {
    setIsGenerating(true)
    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setGeneratedContent(`Estimado/a ${lead.name},

Espero que este mensaje le encuentre bien. Mi nombre es Juan Perez y me comunico de NoonApp.

He notado el crecimiento de ${lead.company || 'su empresa'} y creo que podriamos ayudarles a ${lead.notes || 'optimizar sus procesos digitales'}.

Me encantaria agendar una breve llamada de 15 minutos para explorar como podemos colaborar.

¿Le funcionaria esta semana?

Saludos cordiales,
Juan Perez
NoonApp`)
    setIsGenerating(false)
  }

  const handleGenerateProposal = async () => {
    setIsGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setGeneratedContent(`# Propuesta de Proyecto - ${lead.company || lead.name}

## Resumen Ejecutivo
Propuesta para ${lead.notes || 'desarrollo de solucion digital personalizada'}.

## Alcance del Proyecto
- Analisis de requerimientos
- Diseño de arquitectura
- Desarrollo e implementacion
- Testing y QA
- Deployment y soporte inicial

## Inversion
Valor estimado: $${lead.value.toLocaleString()} USD

## Timeline
- Fase 1: 2 semanas
- Fase 2: 4 semanas
- Fase 3: 2 semanas

Total: 8 semanas

## Proximos Pasos
1. Validar alcance con cliente
2. Firma de contrato
3. Kickoff del proyecto`)
    setIsGenerating(false)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent)
    toast.success('Copiado al portapapeles')
  }

  const handleOpenGmail = () => {
    if (!hasValidEmail) {
      return
    }

    window.open(buildGmailComposeUrl(lead.email), '_blank', 'noopener,noreferrer')
  }

  useEffect(() => {
    let isActive = true

    setIsActivityLoading(true)

    getLeadActivity(lead.id)
      .then((nextActivities) => {
        if (isActive) {
          setActivities(nextActivities)
        }
      })
      .catch((error) => {
        if (isActive) {
          toast.error(error instanceof Error ? error.message : 'No se pudo cargar el historial')
        }
      })
      .finally(() => {
        if (isActive) {
          setIsActivityLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [getLeadActivity, lead.id, lead.updatedAt])

  useEffect(() => {
    let isActive = true

    setIsProposalsLoading(true)

    getLeadProposals(lead.id)
      .then((nextProposals) => {
        if (isActive) {
          setProposals(nextProposals)
        }
      })
      .catch((error) => {
        if (isActive) {
          toast.error(error instanceof Error ? error.message : 'No se pudieron cargar las propuestas')
        }
      })
      .finally(() => {
        if (isActive) {
          setIsProposalsLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [getLeadProposals, lead.id, lead.updatedAt])

  useEffect(() => {
    setProposalForm((prev) => ({
      title: prev.title || buildDefaultProposalTitle(lead),
      amount: prev.amount || lead.value.toString(),
      body: prev.body,
    }))
  }, [lead])

  const handleSaveNote = async () => {
    const trimmedNote = noteText.trim()

    if (!trimmedNote) {
      return
    }

    setIsSavingNote(true)

    try {
      const activity = await addLeadNote(lead.id, trimmedNote)
      setActivities((prev) => [activity, ...prev])
      toast.success('Nota guardada')
      setNoteText('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar la nota')
    } finally {
      setIsSavingNote(false)
    }
  }

  const handleSaveProposal = async () => {
    const title = proposalForm.title.trim()
    const body = proposalForm.body.trim()
    const amount = Number.parseFloat(proposalForm.amount)

    if (!title || !body) {
      return
    }

    setIsSavingProposal(true)

    try {
      const proposal = await addLeadProposal(lead.id, {
        title,
        body,
        amount: Number.isFinite(amount) ? amount : 0,
        currency: 'USD',
        status: 'draft',
      })
      setProposals((prev) => [proposal, ...prev])
      toast.success('Propuesta guardada')
      setProposalForm({
        title: buildDefaultProposalTitle(lead),
        amount: lead.value.toString(),
        body: '',
      })
      void getLeadActivity(lead.id).then(setActivities).catch(() => {})
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar la propuesta')
    } finally {
      setIsSavingProposal(false)
    }
  }

  const handleSaveGeneratedProposal = async () => {
    if (!generatedContent.trim()) {
      return
    }

    setIsSavingProposal(true)

    try {
      const proposal = await addLeadProposal(lead.id, {
        title: buildDefaultProposalTitle(lead),
        body: generatedContent,
        amount: lead.value,
        currency: 'USD',
        status: 'draft',
      })
      setProposals((prev) => [proposal, ...prev])
      toast.success('Propuesta guardada desde IA')
      void getLeadActivity(lead.id).then(setActivities).catch(() => {})
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar la propuesta')
    } finally {
      setIsSavingProposal(false)
    }
  }

  const handleProposalStatusChange = async (proposalId: string, status: ProposalStatus) => {
    try {
      const updatedProposal = await updateLeadProposalStatus(lead.id, proposalId, status)
      setProposals((prev) =>
        prev.map((proposal) => (proposal.id === proposalId ? updatedProposal : proposal))
      )
      toast.success('Estado de propuesta actualizado')
      void getLeadActivity(lead.id).then(setActivities).catch(() => {})
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo actualizar la propuesta')
    }
  }

  const handleCreateProject = async (proposalId: string) => {
    setCreatingProjectProposalId(proposalId)

    try {
      const project = await createProjectFromProposal(lead.id, proposalId)
      toast.success(`Proyecto listo: ${project.name}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo crear el proyecto')
    } finally {
      setCreatingProjectProposalId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'size-16 rounded-xl flex items-center justify-center font-bold text-2xl',
              getScoreColor(lead.score)
            )}
          >
            {lead.score}
          </div>
          <div>
            <h2 className="text-xl font-bold">{lead.name}</h2>
            {lead.company && (
              <p className="text-muted-foreground flex items-center gap-1">
                <Building2 className="size-4" />
                {lead.company}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">${lead.value.toLocaleString()}</p>
          <Badge variant="outline" className={statusConfig[lead.status].color}>
            {statusConfig[lead.status].label}
          </Badge>
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Mail className="size-4 text-muted-foreground" />
          {gmailComposeUrl ? (
            <a
              href={gmailComposeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {lead.email}
            </a>
          ) : (
            <span>{lead.email}</span>
          )}
        </div>
        {lead.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="size-4 text-muted-foreground" />
            <a href={`tel:${lead.phone}`} className="text-primary hover:underline">
              {lead.phone}
            </a>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <Tag className="size-4 text-muted-foreground" />
          <span>{sourceLabels[lead.source]}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="size-4 text-muted-foreground" />
          <span>Creado: {lead.createdAt.toLocaleDateString('es-MX')}</span>
        </div>
        {lead.lastContactedAt && (
          <div className="flex items-center gap-2 text-sm col-span-2">
            <Clock className="size-4 text-muted-foreground" />
            <span>Ultimo contacto: {lead.lastContactedAt.toLocaleDateString('es-MX')}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {lead.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {lead.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Notes */}
      {lead.notes && (
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium mb-1">Notas</p>
          <p className="text-sm text-muted-foreground">{lead.notes}</p>
        </div>
      )}

      <Separator />

      {/* Actions Tabs */}
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="activity" className="flex-1">Seguimiento</TabsTrigger>
          <TabsTrigger value="proposal" className="flex-1">Propuesta</TabsTrigger>
          <TabsTrigger value="status" className="flex-1">Estado</TabsTrigger>
          <TabsTrigger value="ai" className="flex-1">IA Asistente</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4 pt-4">
          <div className="space-y-3">
            <label className="text-sm font-medium">Registrar nota de seguimiento</label>
            <Textarea
              placeholder="Escribe una nota sobre este lead..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={4}
            />
            <Button onClick={handleSaveNote} disabled={!noteText.trim() || isSavingNote}>
              {isSavingNote ? (
                <Loader2 className="size-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4 mr-2" />
              )}
              Guardar nota
            </Button>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <History className="size-4 text-muted-foreground" />
              <p className="text-sm font-medium">Historial de actividad</p>
            </div>

            {isActivityLoading ? (
              <div className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Cargando historial...
              </div>
            ) : activities.length === 0 ? (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Aun no hay actividad registrada para este lead.
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="rounded-lg border bg-muted/20 p-3 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{formatActivityTitle(activity)}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.actorName} - {activity.createdAt.toLocaleString('es-MX')}
                        </p>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {activity.type === 'note_added' ? 'Nota' : activity.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {formatActivityBody(activity)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="proposal" className="space-y-4 pt-4">
          <Card className="gap-4 py-4">
            <CardHeader className="px-4">
              <CardTitle className="text-base">Registrar propuesta comercial</CardTitle>
            </CardHeader>
            <CardContent className="px-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="proposal-title">Titulo</Label>
                  <Input
                    id="proposal-title"
                    value={proposalForm.title}
                    onChange={(event) =>
                      setProposalForm((prev) => ({ ...prev, title: event.target.value }))
                    }
                    placeholder="Propuesta - Cliente"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proposal-amount">Monto estimado</Label>
                  <Input
                    id="proposal-amount"
                    type="number"
                    min="0"
                    value={proposalForm.amount}
                    onChange={(event) =>
                      setProposalForm((prev) => ({ ...prev, amount: event.target.value }))
                    }
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="proposal-body">Contenido</Label>
                  {generatedContent && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setProposalForm((prev) => ({
                          ...prev,
                          body: generatedContent,
                          title: prev.title || buildDefaultProposalTitle(lead),
                          amount: prev.amount || lead.value.toString(),
                        }))
                      }
                    >
                      Usar contenido IA
                    </Button>
                  )}
                </div>
                <Textarea
                  id="proposal-body"
                  value={proposalForm.body}
                  onChange={(event) =>
                    setProposalForm((prev) => ({ ...prev, body: event.target.value }))
                  }
                  placeholder="Describe alcance, inversion y siguientes pasos..."
                  rows={8}
                />
              </div>

              <Button
                onClick={handleSaveProposal}
                disabled={!proposalForm.title.trim() || !proposalForm.body.trim() || isSavingProposal}
              >
                {isSavingProposal ? (
                  <Loader2 className="size-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="size-4 mr-2" />
                )}
                Guardar propuesta
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="size-4 text-muted-foreground" />
              <p className="text-sm font-medium">Hand-off comercial</p>
            </div>

            {isProposalsLoading ? (
              <div className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Cargando propuestas...
              </div>
            ) : proposals.length === 0 ? (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Aun no hay propuestas persistidas para este lead.
              </div>
            ) : (
              <div className="space-y-3">
                {proposals.map((proposal) => (
                  <div key={proposal.id} className="rounded-lg border bg-muted/20 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{proposal.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {proposal.currency} ${proposal.amount.toLocaleString()} - {proposal.createdAt.toLocaleDateString('es-MX')}
                        </p>
                      </div>
                      <Badge variant="outline" className={proposalStatusConfig[proposal.status].color}>
                        {proposalStatusConfig[proposal.status].label}
                      </Badge>
                    </div>

                    <p className="text-sm whitespace-pre-wrap text-muted-foreground max-h-40 overflow-y-auto">
                      {proposal.body}
                    </p>

                    {projectByProposalId.get(proposal.id) && (
                      <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary">
                        <FolderKanban className="size-4" />
                        Proyecto creado: {projectByProposalId.get(proposal.id)?.name}
                      </div>
                    )}

                    <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                      <div className="text-xs text-muted-foreground">
                        {projectByProposalId.get(proposal.id)
                          ? 'Hand-off convertido y persistido en proyectos.'
                          : proposal.handoffReadyAt
                          ? `Hand-off listo desde ${proposal.handoffReadyAt.toLocaleString('es-MX')}`
                          : proposal.acceptedAt
                            ? `Aceptada el ${proposal.acceptedAt.toLocaleString('es-MX')}`
                            : proposal.sentAt
                              ? `Enviada el ${proposal.sentAt.toLocaleString('es-MX')}`
                              : 'Aun en preparacion comercial'}
                      </div>
                      <Select
                        value={proposal.status}
                        onValueChange={(value) =>
                          handleProposalStatusChange(proposal.id, value as ProposalStatus)
                        }
                      >
                        <SelectTrigger className="w-full md:w-[220px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(proposalStatusConfig).map(([status, config]) => (
                            <SelectItem key={status} value={status}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {proposal.status === 'handoff_ready' && (
                      <Button
                        type="button"
                        variant={projectByProposalId.get(proposal.id) ? 'secondary' : 'default'}
                        onClick={() => handleCreateProject(proposal.id)}
                        disabled={
                          creatingProjectProposalId === proposal.id ||
                          Boolean(projectByProposalId.get(proposal.id))
                        }
                      >
                        {creatingProjectProposalId === proposal.id ? (
                          <Loader2 className="size-4 mr-2 animate-spin" />
                        ) : (
                          <FolderKanban className="size-4 mr-2" />
                        )}
                        {projectByProposalId.get(proposal.id) ? 'Proyecto creado' : 'Crear proyecto'}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="status" className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Cambiar estado</label>
            <Select
              value={lead.status}
              onValueChange={(value) => onStatusChange(lead.id, value as LeadStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusConfig).map(([status, config]) => (
                  <SelectItem key={status} value={status}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={handleOpenGmail}
              disabled={!hasValidEmail}
            >
              <MessageSquare className="size-4 mr-2" />
              Abrir en Gmail
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              <Phone className="size-4 mr-2" />
              Llamar
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              <Calendar className="size-4 mr-2" />
              Agendar
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4 pt-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleGenerateEmail}
              disabled={isGenerating}
              className="flex-1 bg-transparent"
            >
              <Sparkles className="size-4 mr-2" />
              Generar Email
            </Button>
            <Button
              variant="outline"
              onClick={handleGenerateProposal}
              disabled={isGenerating}
              className="flex-1 bg-transparent"
            >
              <FileText className="size-4 mr-2" />
              Generar Propuesta
            </Button>
          </div>

          {isGenerating && (
            <div className="p-8 text-center">
              <div className="animate-pulse flex flex-col items-center gap-2">
                <Sparkles className="size-8 text-primary" />
                <p className="text-sm text-muted-foreground">Maxwell esta generando contenido...</p>
              </div>
            </div>
          )}

          {generatedContent && !isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Contenido generado</p>
                <Button size="sm" variant="ghost" onClick={copyToClipboard}>
                  <Copy className="size-4 mr-1" />
                  Copiar
                </Button>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg max-h-64 overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap font-sans">{generatedContent}</pre>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1">
                  <Send className="size-4 mr-2" />
                  Enviar al cliente
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={handleSaveGeneratedProposal}
                  disabled={isSavingProposal}
                >
                  {isSavingProposal ? (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="size-4 mr-2" />
                  )}
                  Guardar propuesta
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
