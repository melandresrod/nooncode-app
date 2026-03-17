'use client'

import { useState } from 'react'
import { useAuth, getRoleLabel } from '@/lib/auth-context'
import { useData } from '@/lib/data-context'
import { selectEarningsSummary } from '@/lib/dashboard-selectors'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Wallet,
  CreditCard,
  FileText,
  Download,
} from 'lucide-react'

interface Commission {
  id: string
  projectName: string
  clientName: string
  amount: number
  percentage: number
  status: 'pending' | 'approved' | 'paid'
  date: Date
}

const mockCommissions: Commission[] = [
  {
    id: 'c1',
    projectName: 'EduLearn LMS Platform',
    clientName: 'EduLearn',
    amount: 2750,
    percentage: 5,
    status: 'pending',
    date: new Date('2024-12-01'),
  },
  {
    id: 'c2',
    projectName: 'HealthTech Telemedicina',
    clientName: 'HealthTech IO',
    amount: 1750,
    percentage: 5,
    status: 'approved',
    date: new Date('2024-11-15'),
  },
  {
    id: 'c3',
    projectName: 'Retail Plus E-commerce',
    clientName: 'Retail Plus',
    amount: 1400,
    percentage: 5,
    status: 'paid',
    date: new Date('2024-10-20'),
  },
]

interface Transaction {
  id: string
  type: 'commission' | 'bonus' | 'payout'
  description: string
  amount: number
  date: Date
}

const mockTransactions: Transaction[] = [
  { id: 't1', type: 'commission', description: 'Comision: EduLearn LMS', amount: 2750, date: new Date('2024-12-01') },
  { id: 't2', type: 'bonus', description: 'Bono: Meta mensual alcanzada', amount: 500, date: new Date('2024-11-30') },
  { id: 't3', type: 'commission', description: 'Comision: HealthTech', amount: 1750, date: new Date('2024-11-15') },
  { id: 't4', type: 'payout', description: 'Retiro a cuenta bancaria', amount: -3000, date: new Date('2024-11-10') },
  { id: 't5', type: 'commission', description: 'Comision: Retail Plus', amount: 1400, date: new Date('2024-10-20') },
]

const statusConfig = {
  pending: { label: 'Pendiente', color: 'bg-yellow-500/10 text-yellow-600' },
  approved: { label: 'Aprobada', color: 'bg-blue-500/10 text-blue-600' },
  paid: { label: 'Pagada', color: 'bg-green-500/10 text-green-600' },
}

export default function EarningsPage() {
  const { user } = useAuth()
  const { users } = useData()
  const [activeTab, setActiveTab] = useState('overview')

  if (!user) return null

  const sharedUser = users.find((candidate) => candidate.id === user.id) ?? user

  const {
    totalEarnings,
    pendingCommissions,
    approvedCommissions,
    monthlyGoal,
    monthlyProgress,
    remainingToGoal,
  } = selectEarningsSummary(sharedUser.balance, mockCommissions)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mis Ganancias</h1>
          <p className="text-muted-foreground">
            Balance, comisiones y historial de transacciones
          </p>
        </div>
        <Button className="w-fit">
          <CreditCard className="size-4 mr-2" />
          Solicitar Retiro
        </Button>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary-foreground/80">
              Balance Disponible
            </CardTitle>
            <Wallet className="size-4 text-primary-foreground/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${sharedUser.balance.toLocaleString()}</div>
            <p className="text-xs text-primary-foreground/70 mt-1">
              Disponible para retiro
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comisiones Pendientes</CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingCommissions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">En espera de aprobacion</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comisiones Aprobadas</CardTitle>
            <CheckCircle2 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${approvedCommissions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Listas para pago</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ganado</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="size-3 text-green-600" />
              <span className="text-green-600">+18%</span> vs mes anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Goal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Meta del Mes</CardTitle>
              <CardDescription>Progreso hacia tu objetivo mensual</CardDescription>
            </div>
            <span className="text-2xl font-bold">
              ${sharedUser.balance.toLocaleString()} / ${monthlyGoal.toLocaleString()}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={monthlyProgress} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            {monthlyProgress >= 100
              ? 'Meta alcanzada!'
              : `Faltan $${remainingToGoal.toLocaleString()} para tu meta`}
          </p>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="commissions">Comisiones</TabsTrigger>
          <TabsTrigger value="transactions">Transacciones</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Commissions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Comisiones Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCommissions.slice(0, 3).map((commission) => (
                    <div key={commission.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{commission.projectName}</p>
                        <p className="text-xs text-muted-foreground">{commission.clientName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">+${commission.amount.toLocaleString()}</p>
                        <Badge variant="outline" className={statusConfig[commission.status].color}>
                          {statusConfig[commission.status].label}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Commission Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Desglose por Rol</CardTitle>
                <CardDescription>Comision segun tu rol: {getRoleLabel(user.role)}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <DollarSign className="size-5 text-primary" />
                      <div>
                        <p className="font-medium">Comision por venta</p>
                        <p className="text-xs text-muted-foreground">Por cada deal cerrado</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-primary">5%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="size-5 text-accent" />
                      <div>
                        <p className="font-medium">Bono por meta</p>
                        <p className="text-xs text-muted-foreground">Al alcanzar meta mensual</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-accent">$500</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="commissions" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Historial de Comisiones</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="size-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proyecto</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Porcentaje</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockCommissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell className="font-medium">{commission.projectName}</TableCell>
                      <TableCell>{commission.clientName}</TableCell>
                      <TableCell>{commission.percentage}%</TableCell>
                      <TableCell className="font-semibold">${commission.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusConfig[commission.status].color}>
                          {statusConfig[commission.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>{commission.date.toLocaleDateString('es-MX')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Historial de Transacciones</CardTitle>
                <Button variant="outline" size="sm">
                  <FileText className="size-4 mr-2" />
                  Estado de cuenta
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`size-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'payout'
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-green-500/10 text-green-600'
                      }`}>
                        {transaction.type === 'payout' ? (
                          <CreditCard className="size-5" />
                        ) : transaction.type === 'bonus' ? (
                          <TrendingUp className="size-5" />
                        ) : (
                          <DollarSign className="size-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.date.toLocaleDateString('es-MX', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <span className={`text-lg font-bold ${
                      transaction.amount < 0 ? 'text-destructive' : 'text-green-600'
                    }`}>
                      {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
