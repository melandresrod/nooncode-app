'use client'

import { useState } from 'react'
import type { Lead, LeadStatus } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
} from 'lucide-react'

interface LeadDetailProps {
  lead: Lead
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void
  onClose: () => void
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

export function LeadDetail({ lead, onStatusChange, onClose }: LeadDetailProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [noteText, setNoteText] = useState('')
  const hasValidEmail = isValidLeadEmail(lead.email)
  const gmailComposeUrl = hasValidEmail ? buildGmailComposeUrl(lead.email) : null

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
      <Tabs defaultValue="status" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="status" className="flex-1">Estado</TabsTrigger>
          <TabsTrigger value="ai" className="flex-1">IA Asistente</TabsTrigger>
          <TabsTrigger value="notes" className="flex-1">Agregar Nota</TabsTrigger>
        </TabsList>

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
              <Button className="w-full">
                <Send className="size-4 mr-2" />
                Enviar al cliente
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="notes" className="space-y-4 pt-4">
          <Textarea
            placeholder="Escribe una nota sobre este lead..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={4}
          />
          <Button
            onClick={() => {
              toast.success('Nota guardada')
              setNoteText('')
            }}
            disabled={!noteText.trim()}
          >
            <CheckCircle2 className="size-4 mr-2" />
            Guardar nota
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  )
}
