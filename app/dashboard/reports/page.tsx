'use client'

import { useMemo } from 'react'
import { useAuth, canViewAllStats } from '@/lib/auth-context'
import { useData } from '@/lib/data-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip as ChartTooltip } from 'recharts'
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { DollarSign, Target, Award, Clock } from 'lucide-react'

export default function ReportsPage() {
  const { user } = useAuth()
  const { leads, projects, tasks } = useData()

  const canViewAll = user ? canViewAllStats(user.role) : false

  const pipelineData = useMemo(() => {
    const statusCounts: Record<string, { count: number; value: number }> = {}
    const statuses = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']
    
    statuses.forEach(status => {
      statusCounts[status] = { count: 0, value: 0 }
    })
    
    leads.forEach(lead => {
      if (statusCounts[lead.status]) {
        statusCounts[lead.status].count++
        statusCounts[lead.status].value += lead.value
      }
    })

    return [
      { name: 'Nuevos', count: statusCounts.new.count, value: statusCounts.new.value },
      { name: 'Contactados', count: statusCounts.contacted.count, value: statusCounts.contacted.value },
      { name: 'Calificados', count: statusCounts.qualified.count, value: statusCounts.qualified.value },
      { name: 'Propuesta', count: statusCounts.proposal.count, value: statusCounts.proposal.value },
      { name: 'Negociacion', count: statusCounts.negotiation.count, value: statusCounts.negotiation.value },
      { name: 'Ganados', count: statusCounts.won.count, value: statusCounts.won.value },
    ]
  }, [leads])

  const monthlyData = useMemo(() => {
    return [
      { month: 'Sep', leads: 12, ventas: 3, ingresos: 45000 },
      { month: 'Oct', leads: 18, ventas: 5, ingresos: 72000 },
      { month: 'Nov', leads: 15, ventas: 4, ingresos: 58000 },
      { month: 'Dic', leads: 22, ventas: 7, ingresos: 95000 },
      { month: 'Ene', leads: 28, ventas: 8, ingresos: 120000 },
      { month: 'Feb', leads: leads.length, ventas: leads.filter(l => l.status === 'won').length, ingresos: leads.filter(l => l.status === 'won').reduce((s, l) => s + l.value, 0) },
    ]
  }, [leads])

  const sourceData = useMemo(() => {
    const sources: Record<string, number> = {}
    leads.forEach(lead => {
      sources[lead.source] = (sources[lead.source] || 0) + 1
    })
    
    const sourceLabels: Record<string, string> = {
      website: 'Sitio Web',
      referral: 'Referidos',
      social_media: 'Redes Sociales',
      cold_outreach: 'Contacto Frio',
      event: 'Eventos',
      other: 'Otros',
    }

    return Object.entries(sources).map(([key, value]) => ({
      name: sourceLabels[key] || key,
      value,
    }))
  }, [leads])

  const projectStatusData = useMemo(() => {
    const statusLabels: Record<string, string> = {
      backlog: 'Backlog',
      in_progress: 'En Progreso',
      review: 'Revision',
      delivered: 'Entregado',
      completed: 'Completado',
    }

    const counts: Record<string, number> = {}
    projects.forEach(p => {
      counts[p.status] = (counts[p.status] || 0) + 1
    })

    return Object.entries(counts).map(([key, value]) => ({
      name: statusLabels[key] || key,
      value,
    }))
  }, [projects])

  const stats = useMemo(() => {
    const totalLeads = leads.length
    const wonLeads = leads.filter(l => l.status === 'won').length
    const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0
    const totalRevenue = leads.filter(l => l.status === 'won').reduce((s, l) => s + l.value, 0)
    const avgDealSize = wonLeads > 0 ? Math.round(totalRevenue / wonLeads) : 0
    const activeProjects = projects.filter(p => p.status === 'in_progress').length
    const completedTasks = tasks.filter(t => t.status === 'done').length
    const avgScore = leads.length > 0 ? Math.round(leads.reduce((s, l) => s + l.score, 0) / leads.length) : 0

    return {
      totalLeads,
      wonLeads,
      conversionRate,
      totalRevenue,
      avgDealSize,
      activeProjects,
      completedTasks,
      avgScore,
    }
  }, [leads, projects, tasks])

  const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

  if (!user) return null

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-balance">Reportes y Analiticas</h1>
        <p className="text-muted-foreground">
          {canViewAll ? 'Vision general del rendimiento del equipo' : 'Tu rendimiento personal'}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Conversion</CardTitle>
            <Target className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.wonLeads} de {stats.totalLeads} leads
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Promedio ${stats.avgDealSize.toLocaleString()} por venta
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Promedio</CardTitle>
            <Award className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgScore}</div>
            <p className="text-xs text-muted-foreground">
              Calidad de leads
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proyectos Activos</CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedTasks} tareas completadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Ventas</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="sources">Fuentes</TabsTrigger>
          <TabsTrigger value="projects">Proyectos</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tendencia Mensual</CardTitle>
                <CardDescription>Leads, ventas e ingresos por mes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <ChartTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="leads" stroke="#6366f1" name="Leads" strokeWidth={2} />
                      <Line type="monotone" dataKey="ventas" stroke="#22c55e" name="Ventas" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ingresos Mensuales</CardTitle>
                <CardDescription>Evolucion de ingresos por ventas cerradas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} className="text-xs" />
                      <ChartTooltip 
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Ingresos']}
                      />
                      <Bar dataKey="ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} name="Ingresos" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Embudo de Ventas</CardTitle>
              <CardDescription>Distribucion de leads por etapa del pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipelineData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis type="category" dataKey="name" className="text-xs" />
                    <ChartTooltip />
                    <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} name="Leads" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fuentes de Leads</CardTitle>
              <CardDescription>Distribucion por canal de adquisicion</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sourceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sourceData.map((entry, index) => (
                        <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estado de Proyectos</CardTitle>
              <CardDescription>Distribucion de proyectos por estado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={projectStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {projectStatusData.map((entry, index) => (
                        <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
