'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useData } from '@/lib/data-context'
import { mockPointEvents } from '@/lib/mock-data'
import type { Reward } from '@/lib/types'
import {
  rewardCategoryConfig,
  selectRewardHistoryItems,
  selectRewardRedeemDialog,
  selectRewardsOverview,
  selectRewardStoreItems,
  type RewardCategoryFilter,
} from '@/lib/dashboard-selectors'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Gift,
  Star,
  Trophy,
  Zap,
  Clock,
  TrendingUp,
  ShoppingBag,
  Sparkles,
} from 'lucide-react'

export default function RewardsPage() {
  const { user } = useAuth()
  const { rewards } = useData()
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<RewardCategoryFilter>('all')
  const [activeTab, setActiveTab] = useState('store')

  if (!user) return null

  const pointEvents = mockPointEvents
  const rewardStoreItems = selectRewardStoreItems(rewards, categoryFilter, user.points)
  const rewardHistoryItems = selectRewardHistoryItems(pointEvents, user.id)
  const {
    totalPointsEarned,
    nextTierPoints,
    tierProgress,
    pointsToNextTier,
    rewardsRedeemedThisYear,
    pointsThisMonth,
    monthlyTrendLabel,
    currentStreakLabel,
  } = selectRewardsOverview(user.points, pointEvents, user.id)
  const selectedRewardDialog = selectedReward
    ? selectRewardRedeemDialog(selectedReward, user.points)
    : null

  const handleRedeem = (reward: Reward) => {
    if (user.points >= reward.pointsCost) {
      toast.success(`Has canjeado: ${reward.name}`)
      setSelectedReward(null)
    } else {
      toast.error('No tienes suficientes puntos')
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Recompensas</h1>
          <p className="text-muted-foreground">
            Canjea tus puntos por increibles premios
          </p>
        </div>
      </div>

      {/* Points Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary-foreground/80 flex items-center gap-2">
              <Star className="size-4" />
              Tus Puntos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{user.points.toLocaleString()}</div>
            <p className="text-sm text-primary-foreground/70 mt-2">
              Disponibles para canjear
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Progreso al siguiente nivel</CardTitle>
              <Badge variant="secondary" className="bg-accent/10 text-accent">
                <Trophy className="size-3 mr-1" />
                Nivel Gold
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between mb-2">
              <span className="text-sm text-muted-foreground">Silver</span>
              <span className="text-lg font-bold">{user.points} / {nextTierPoints}</span>
              <span className="text-sm text-muted-foreground">Gold</span>
            </div>
            <Progress value={tierProgress} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {tierProgress >= 100
                ? 'Has alcanzado el nivel Gold!'
                : `Faltan ${pointsToNextTier} puntos para nivel Gold`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Puntos Ganados</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPointsEarned.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total historico</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recompensas Canjeadas</CardTitle>
            <Gift className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rewardsRedeemedThisYear}</div>
            <p className="text-xs text-muted-foreground">Este año</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Puntos este Mes</CardTitle>
            <Zap className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pointsThisMonth}</div>
            <p className="text-xs text-muted-foreground">{monthlyTrendLabel}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Racha Actual</CardTitle>
            <Sparkles className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStreakLabel}</div>
            <p className="text-xs text-muted-foreground">Sigue asi!</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="store">
            <ShoppingBag className="size-4 mr-2" />
            Tienda
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="size-4 mr-2" />
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="store" className="mt-6 space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={categoryFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategoryFilter('all')}
            >
              Todos
            </Button>
            {Object.entries(rewardCategoryConfig).map(([key, config]) => {
              const Icon = config.icon
              return (
                <Button
                  key={key}
                  variant={categoryFilter === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter(key as RewardCategoryFilter)}
                >
                  <Icon className="size-4 mr-1" />
                  {config.label}
                </Button>
              )
            })}
          </div>

          {/* Rewards Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rewardStoreItems.map((rewardItem) => {
              const Icon = rewardItem.categoryIcon

              return (
                <Card
                  key={rewardItem.reward.id}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-lg',
                    !rewardItem.canAfford && 'opacity-60'
                  )}
                  onClick={() => setSelectedReward(rewardItem.reward)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn(
                        'size-12 rounded-xl flex items-center justify-center',
                        rewardItem.categoryColor
                      )}>
                        <Icon className="size-6" />
                      </div>
                      <Badge variant="outline" className={rewardItem.categoryColor}>
                        {rewardItem.categoryLabel}
                      </Badge>
                    </div>
                    <h3 className="font-semibold mb-1">{rewardItem.reward.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {rewardItem.reward.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-primary font-bold">
                        <Star className="size-4 fill-primary" />
                        {rewardItem.pointsCostLabel}
                      </div>
                      <Button
                        size="sm"
                        variant={rewardItem.canAfford ? 'default' : 'secondary'}
                        disabled={!rewardItem.canAfford}
                      >
                        {rewardItem.actionLabel}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historial de Puntos</CardTitle>
              <CardDescription>Tus ultimas actividades que generaron puntos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rewardHistoryItems.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Aun no tienes actividad registrada
                  </p>
                ) : (
                  rewardHistoryItems.map((historyItem) => {
                    const Icon = historyItem.eventIcon

                    return (
                      <div
                        key={historyItem.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon className="size-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{historyItem.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {historyItem.eventLabel} - {historyItem.createdAtLabel}
                            </p>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-primary">
                          {historyItem.pointsLabel}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Redeem Dialog */}
      <Dialog open={!!selectedReward} onOpenChange={() => setSelectedReward(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Canjear Recompensa</DialogTitle>
            <DialogDescription>
              Confirma que deseas canjear esta recompensa
            </DialogDescription>
          </DialogHeader>
          {selectedReward && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className={cn(
                  'size-16 rounded-xl flex items-center justify-center shrink-0',
                  selectedRewardDialog?.categoryColor
                )}>
                  {selectedRewardDialog && <selectedRewardDialog.categoryIcon className="size-8" />}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedReward.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedReward.description}</p>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Costo</span>
                  <span className="font-bold flex items-center gap-1">
                    <Star className="size-4 fill-primary text-primary" />
                    {selectedRewardDialog?.pointsCostLabel}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Tus puntos</span>
                  <span className="font-bold">{selectedRewardDialog?.userPointsLabel}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Puntos restantes</span>
                    <span className={cn(
                      'font-bold',
                      selectedRewardDialog?.remainingPointsTone
                    )}>
                      {selectedRewardDialog?.remainingPointsLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReward(null)}>
              Cancelar
            </Button>
            <Button
              onClick={() => selectedReward && handleRedeem(selectedReward)}
              disabled={!selectedReward || !selectedRewardDialog?.canAfford}
            >
              <Gift className="size-4 mr-2" />
              Confirmar Canje
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
