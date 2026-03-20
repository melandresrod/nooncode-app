'use client'

import { useState } from 'react'
import { useAuth, getRoleLabel } from '@/lib/auth-context'
import { useData } from '@/lib/data-context'
import {
  selectSettingsDirectoryRows,
  selectSettingsRoleCards,
  selectSettingsUserRows,
  settingsNotificationOptions,
  settingsPermissionRows,
} from '@/lib/dashboard-selectors'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  Settings,
  Users,
  Shield,
  Bell,
  Database,
  Mail,
  Building,
  CheckCircle,
  Edit,
  Trash2,
} from 'lucide-react'

export default function SettingsPage() {
  const { authMode, user, switchRole } = useAuth()
  const {
    isSettingsUsersLoading,
    settingsUsers,
    settingsUsersError,
    refreshSettingsUsers,
    users,
  } = useData()
  const [activeTab, setActiveTab] = useState('general')
  const isSupabaseMode = authMode === 'supabase'

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <Shield className="size-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Acceso Restringido</h2>
          <p className="text-muted-foreground">
            Solo los administradores pueden acceder a esta seccion.
          </p>
        </Card>
      </div>
    )
  }

  const settingsUserRows = selectSettingsUserRows(users)
  const settingsDirectoryRows = selectSettingsDirectoryRows(settingsUsers)
  const settingsRoleCards = selectSettingsRoleCards(users, user.role)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Configuracion</h1>
        <p className="text-muted-foreground">
          Administra la configuracion del sistema y usuarios
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">
            <Settings className="size-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="size-4 mr-2" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="roles">
            <Shield className="size-4 mr-2" />
            {isSupabaseMode ? 'Roles y Permisos' : 'Demo Roles'}
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="size-4 mr-2" />
            Notificaciones
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building className="size-5" />
                Informacion de la Empresa
              </CardTitle>
              <CardDescription>
                {isSupabaseMode
                  ? 'Vista de solo lectura. La persistencia de esta configuracion aun no esta conectada en esta pantalla.'
                  : 'Configura los datos basicos de tu organizacion'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company">Nombre de la empresa</Label>
                  <Input id="company" defaultValue="NoonApp Corp" disabled={isSupabaseMode} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain">Dominio</Label>
                  <Input id="domain" defaultValue="noon.app" disabled={isSupabaseMode} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email de contacto</Label>
                  <Input id="email" type="email" defaultValue="admin@noon.app" disabled={isSupabaseMode} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Zona horaria</Label>
                  <Select defaultValue="america_mexico" disabled={isSupabaseMode}>
                    <SelectTrigger disabled={isSupabaseMode}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="america_mexico">America/Mexico_City</SelectItem>
                      <SelectItem value="america_bogota">America/Bogota</SelectItem>
                      <SelectItem value="america_lima">America/Lima</SelectItem>
                      <SelectItem value="america_santiago">America/Santiago</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {isSupabaseMode ? (
                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  Estos campos son referenciales en el runtime actual. La edicion y guardado de company
                  settings aun no estan habilitados en modo supabase.
                </div>
              ) : (
                <Button onClick={() => toast.success('Configuracion guardada')}>
                  Guardar cambios
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="size-5" />
                Integraciones
              </CardTitle>
              <CardDescription>
                {isSupabaseMode
                  ? 'Estado informativo solamente. Esta pantalla no configura ni verifica integraciones reales.'
                  : 'Conecta con servicios externos'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isSupabaseMode ? (
                <>
                  <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-[#635BFF]/10">
                        <span className="font-bold text-[#635BFF]">S</span>
                      </div>
                      <div>
                        <p className="font-medium">Stripe</p>
                        <p className="text-sm text-muted-foreground">Procesamiento de pagos</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          No hay Stripe real ni verificacion de estado conectada desde esta UI.
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-dashed text-muted-foreground">
                      No disponible
                    </Badge>
                  </div>
                  <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-[#3ECF8E]/10">
                        <span className="font-bold text-[#3ECF8E]">S</span>
                      </div>
                      <div>
                        <p className="font-medium">Supabase</p>
                        <p className="text-sm text-muted-foreground">Base de datos y auth del runtime</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          La app usa Supabase en este runtime, pero esta pantalla no permite configurarlo
                          ni validar salud.
                        </p>
                      </div>
                    </div>
                    <Badge className="border-emerald-200 bg-emerald-500/10 text-emerald-700">
                      Runtime activo
                    </Badge>
                  </div>
                  <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-[#4285F4]/10">
                        <Mail className="size-5 text-[#4285F4]" />
                      </div>
                      <div>
                        <p className="font-medium">Gmail / SMTP</p>
                        <p className="text-sm text-muted-foreground">Envio de emails</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          No hay configuracion operativa ni prueba de conexion disponible en esta UI.
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-dashed text-muted-foreground">
                      No disponible
                    </Badge>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="size-10 bg-[#635BFF]/10 rounded-lg flex items-center justify-center">
                        <span className="font-bold text-[#635BFF]">S</span>
                      </div>
                      <div>
                        <p className="font-medium">Stripe</p>
                        <p className="text-sm text-muted-foreground">Procesamiento de pagos</p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200">
                      <CheckCircle className="size-3 mr-1" />
                      Conectado
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="size-10 bg-[#3ECF8E]/10 rounded-lg flex items-center justify-center">
                        <span className="font-bold text-[#3ECF8E]">S</span>
                      </div>
                      <div>
                        <p className="font-medium">Supabase</p>
                        <p className="text-sm text-muted-foreground">Base de datos</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Conectar</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="size-10 bg-[#4285F4]/10 rounded-lg flex items-center justify-center">
                        <Mail className="size-5 text-[#4285F4]" />
                      </div>
                      <div>
                        <p className="font-medium">Gmail / SMTP</p>
                        <p className="text-sm text-muted-foreground">Envio de emails</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Conectar</Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Management */}
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Gestion de Usuarios</CardTitle>
                  <CardDescription>
                    {isSupabaseMode
                      ? 'Directorio real de perfiles sincronizado desde Supabase. La edicion aun no esta habilitada.'
                      : 'Administra los usuarios del sistema'}
                  </CardDescription>
                </div>
                {!isSupabaseMode && (
                  <Button>Nuevo Usuario</Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isSupabaseMode && settingsUsersError ? (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                  <p className="font-medium text-destructive">No se pudo cargar el directorio real.</p>
                  <p className="mt-1 text-sm text-muted-foreground">{settingsUsersError}</p>
                  <Button className="mt-4" variant="outline" onClick={() => { void refreshSettingsUsers() }}>
                    Reintentar
                  </Button>
                </div>
              ) : isSupabaseMode && isSettingsUsersLoading ? (
                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                  Cargando usuarios reales...
                </div>
              ) : isSupabaseMode && settingsDirectoryRows.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                  {isSupabaseMode
                    ? 'No hay perfiles disponibles en el directorio real.'
                    : 'No hay usuarios disponibles.'}
                </div>
              ) : isSupabaseMode ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Ultimo acceso</TableHead>
                      <TableHead>Fecha Registro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {settingsDirectoryRows.map((settingsUser) => (
                      <TableRow key={settingsUser.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarFallback className="text-xs">
                                {settingsUser.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{settingsUser.name}</p>
                              <p className="text-xs text-muted-foreground">{settingsUser.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getRoleLabel(settingsUser.role)}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={settingsUser.statusTone} variant="outline">
                            {settingsUser.statusLabel}
                          </Badge>
                        </TableCell>
                        <TableCell>{settingsUser.lastLoginLabel}</TableCell>
                        <TableCell>{settingsUser.createdAtLabel}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Puntos</TableHead>
                      <TableHead>Fecha Registro</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {settingsUserRows.map((settingsUser) => (
                      <TableRow key={settingsUser.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarFallback className="text-xs">
                                {settingsUser.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{settingsUser.name}</p>
                              <p className="text-xs text-muted-foreground">{settingsUser.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getRoleLabel(settingsUser.role)}</Badge>
                        </TableCell>
                        <TableCell>{settingsUser.balanceLabel}</TableCell>
                        <TableCell>{settingsUser.pointsLabel}</TableCell>
                        <TableCell>{settingsUser.createdAtLabel}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="size-8">
                              <Edit className="size-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="size-8 text-destructive">
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Demo Role Switcher */}
        <TabsContent value="roles" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {isSupabaseMode ? 'Roles del sistema' : 'Cambiar Rol (Demo)'}
              </CardTitle>
              <CardDescription>
                {isSupabaseMode
                  ? 'Con auth real, el rol activo viene de tu sesion y ya no puede cambiarse desde esta pantalla.'
                  : 'Cambia tu rol para ver la aplicacion desde diferentes perspectivas. Esta funcion es solo para propositos de demostracion.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSupabaseMode ? (
                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  El cambio de rol rapido permanece disponible solo en modo demo. En modo
                  supabase, los permisos dependen del perfil real autenticado.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {settingsRoleCards.map((roleCard) => (
                    <button
                      key={roleCard.role}
                      onClick={() => {
                        switchRole(roleCard.role)
                        toast.success(`Cambiado a: ${getRoleLabel(roleCard.role)}`)
                      }}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        roleCard.isActive
                          ? 'border-primary bg-primary/5 ring-2 ring-primary'
                          : 'hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10">
                          <AvatarFallback className={roleCard.isActive ? 'bg-primary text-primary-foreground' : ''}>
                            {roleCard.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{getRoleLabel(roleCard.role)}</p>
                          <p className="text-xs text-muted-foreground">{roleCard.email}</p>
                        </div>
                      </div>
                      {roleCard.isActive && (
                        <Badge className="mt-3 bg-primary text-primary-foreground">
                          Activo
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Permisos por Rol</CardTitle>
              <CardDescription>
                Resumen de acceso a funcionalidades por rol
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Funcionalidad</TableHead>
                    <TableHead className="text-center">Admin</TableHead>
                    <TableHead className="text-center">Sales Mgr</TableHead>
                    <TableHead className="text-center">Sales</TableHead>
                    <TableHead className="text-center">PM</TableHead>
                    <TableHead className="text-center">Dev</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settingsPermissionRows.map((row) => (
                    <TableRow key={row.feature}>
                      <TableCell className="font-medium">{row.feature}</TableCell>
                      {row.perms.map((perm, i) => (
                        <TableCell key={i} className="text-center">
                          {perm ? (
                            <CheckCircle className="size-4 text-emerald-600 mx-auto" />
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preferencias de Notificaciones</CardTitle>
              <CardDescription>
                {isSupabaseMode
                  ? 'Estado informativo solamente. Las preferencias reales de notificacion aun no se pueden editar desde esta pantalla.'
                  : 'Configura como y cuando recibir notificaciones'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isSupabaseMode ? (
                <>
                  <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    Estas preferencias aun no tienen carga, persistencia ni confirmacion de estado en modo
                    supabase. La UI solo describe las categorias previstas.
                  </div>
                  {settingsNotificationOptions.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-4 rounded-lg border p-4">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <Badge variant="outline" className="border-dashed text-muted-foreground">
                        No disponible
                      </Badge>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {settingsNotificationOptions.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  ))}
                  <Separator />
                  <Button onClick={() => toast.success('Preferencias guardadas')}>
                    Guardar preferencias
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
