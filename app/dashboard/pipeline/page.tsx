'use client'

import { useState } from 'react'
import { useData } from '@/lib/data-context'
import type { Lead, LeadStatus } from '@/lib/types'
import { KanbanBoard, type KanbanColumn } from '@/components/kanban-board'
import {
  selectLeadScoreColor,
  selectPipelineBoardSummary,
  selectPipelineColumnStats,
} from '@/lib/dashboard-selectors'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LeadDetail } from '@/components/lead-detail'
import { cn } from '@/lib/utils'
import {
  Building2,
  DollarSign,
  GripVertical,
  Plus,
} from 'lucide-react'
import { LeadFormDialog } from '@/components/lead-form-dialog'

export default function PipelinePage() {
  const { leads, updateLeadStatus } = useData()
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showNewLeadDialog, setShowNewLeadDialog] = useState(false)

  const { columns, totalPipelineValue } = selectPipelineBoardSummary(leads)

  const handleDragEnd = (itemId: string, _sourceColumnId: string, targetColumnId: string) => {
    updateLeadStatus(itemId, targetColumnId as LeadStatus)
  }

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    updateLeadStatus(leadId, newStatus)
    if (selectedLead?.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null))
    }
  }

  const renderCard = (lead: Lead, isDragging: boolean) => (
    <PipelineCard
      lead={lead}
      isDragging={isDragging}
      onClick={() => !isDragging && setSelectedLead(lead)}
    />
  )

  const getColumnStats = (column: KanbanColumn<Lead>) => selectPipelineColumnStats(column.items)

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-balance">Pipeline de Ventas</h1>
          <p className="text-muted-foreground">
            Arrastra los leads entre etapas para actualizar su estado
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Valor total en pipeline</p>
            <p className="text-2xl font-bold text-primary">${totalPipelineValue.toLocaleString()}</p>
          </div>
          <Button onClick={() => setShowNewLeadDialog(true)}>
            <Plus className="size-4 mr-2" />
            Nuevo Lead
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <KanbanBoard
        columns={columns}
        onDragEnd={handleDragEnd}
        renderCard={renderCard}
        getColumnStats={getColumnStats}
      />

      {/* Lead Detail Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del Lead</DialogTitle>
            <DialogDescription>
              Informacion completa y acciones disponibles
            </DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <LeadDetail
              lead={selectedLead}
              onStatusChange={handleStatusChange}
              onClose={() => setSelectedLead(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* New Lead Dialog */}
      <LeadFormDialog
        open={showNewLeadDialog}
        onOpenChange={setShowNewLeadDialog}
      />
    </div>
  )
}

interface PipelineCardProps {
  lead: Lead
  isDragging: boolean
  onClick: () => void
}

function PipelineCard({ lead, isDragging, onClick }: PipelineCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-grab active:cursor-grabbing hover:shadow-md transition-all",
        isDragging && "shadow-lg ring-2 ring-primary"
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <GripVertical className="size-4 text-muted-foreground shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-sm truncate">{lead.name}</h4>
              <span
                className={cn(
                  'text-xs font-bold px-1.5 py-0.5 rounded shrink-0',
                  selectLeadScoreColor(lead.score)
                )}
              >
                {lead.score}
              </span>
            </div>
            {lead.company && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Building2 className="size-3" />
                <span className="truncate">{lead.company}</span>
              </p>
            )}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs font-medium text-primary">
                <DollarSign className="size-3" />
                {lead.value.toLocaleString()}
              </div>
              {lead.tags.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {lead.tags[0]}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
