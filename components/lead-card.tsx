'use client'

import React from "react"

import type { Lead, LeadStatus } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import {
  Building2,
  Mail,
  Phone,
  MoreVertical,
  ArrowRight,
  MessageSquare,
  FileText,
  Calendar,
  Trash2,
} from 'lucide-react'

interface LeadCardProps {
  lead: Lead
  onClick: () => void
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void
  onDelete?: () => void
}

const statusConfig: Record<LeadStatus, { label: string; color: string }> = {
  new: { label: 'Nuevo', color: 'bg-blue-500/10 text-blue-700 border-blue-200' },
  contacted: { label: 'Contactado', color: 'bg-amber-500/10 text-amber-700 border-amber-200' },
  qualified: { label: 'Calificado', color: 'bg-primary/10 text-primary border-primary/20' },
  proposal: { label: 'Propuesta', color: 'bg-orange-500/10 text-orange-700 border-orange-200' },
  negotiation: { label: 'Negociacion', color: 'bg-accent/10 text-accent border-accent/20' },
  won: { label: 'Ganado', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200' },
  lost: { label: 'Perdido', color: 'bg-red-500/10 text-red-700 border-red-200' },
}

const nextStatus: Partial<Record<LeadStatus, LeadStatus>> = {
  new: 'contacted',
  contacted: 'qualified',
  qualified: 'proposal',
  proposal: 'negotiation',
  negotiation: 'won',
}

export function LeadCard({ lead, onClick, onStatusChange, onDelete }: LeadCardProps) {
  const statusInfo = statusConfig[lead.status]
  const next = nextStatus[lead.status]

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-500/10'
    if (score >= 60) return 'text-amber-700 bg-amber-500/10'
    if (score >= 40) return 'text-orange-700 bg-orange-500/10'
    return 'text-red-700 bg-red-500/10'
  }

  const handleQuickAction = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <Card
      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Score Badge */}
        <div
          className={cn(
            'size-12 rounded-lg flex items-center justify-center font-bold text-lg shrink-0',
            getScoreColor(lead.score)
          )}
        >
          {lead.score}
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold truncate">{lead.name}</h3>
              {lead.company && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Building2 className="size-3" />
                  {lead.company}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="outline" className={statusInfo.color}>
                {statusInfo.label}
              </Badge>
              <span className="font-semibold text-primary">
                ${lead.value.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Mail className="size-3" />
              {lead.email}
            </span>
            {lead.phone && (
              <span className="flex items-center gap-1">
                <Phone className="size-3" />
                {lead.phone}
              </span>
            )}
          </div>

          {/* Tags */}
          {lead.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {lead.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1 shrink-0" onClick={handleQuickAction}>
          {next && (
            <Button
              size="sm"
              variant="ghost"
              className="text-xs"
              onClick={(e) => {
                e.stopPropagation()
                onStatusChange(lead.id, next)
              }}
            >
              <ArrowRight className="size-3 mr-1" />
              {statusConfig[next].label}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="size-8">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <MessageSquare className="size-4 mr-2" />
                Enviar email
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Phone className="size-4 mr-2" />
                Llamar
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="size-4 mr-2" />
                Generar propuesta
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Calendar className="size-4 mr-2" />
                Agendar reunion
              </DropdownMenuItem>
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete()
                    }}
                  >
                    <Trash2 className="size-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Cambiar estado</DropdownMenuLabel>
              {Object.entries(statusConfig).map(([status, config]) => (
                <DropdownMenuItem
                  key={status}
                  onClick={(e) => {
                    e.stopPropagation()
                    onStatusChange(lead.id, status as LeadStatus)
                  }}
                  disabled={status === lead.status}
                >
                  {config.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  )
}
