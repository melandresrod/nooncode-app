'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { User, UserRole } from './types'
import { mockUsers } from './mock-data'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  switchRole: (role: UserRole) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase())
    
    if (foundUser) {
      setUser(foundUser)
      setIsLoading(false)
      return true
    }
    
    setIsLoading(false)
    return false
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const switchRole = useCallback((role: UserRole) => {
    const userWithRole = mockUsers.find(u => u.role === role)
    if (userWithRole) {
      setUser(userWithRole)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Role-based access helpers
export function canAccessSales(role: UserRole): boolean {
  return ['admin', 'sales_manager', 'sales'].includes(role)
}

export function canAccessDelivery(role: UserRole): boolean {
  return ['admin', 'pm', 'developer'].includes(role)
}

export function canAccessAdmin(role: UserRole): boolean {
  return role === 'admin'
}

export function canManageTeam(role: UserRole): boolean {
  return ['admin', 'sales_manager', 'pm'].includes(role)
}

export function canViewAllStats(role: UserRole): boolean {
  return ['admin', 'sales_manager'].includes(role)
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    admin: 'Administrador',
    sales_manager: 'Gerente de Ventas',
    sales: 'Vendedor',
    pm: 'Project Manager',
    developer: 'Desarrollador',
  }
  return labels[role]
}

export function getRoleColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    admin: 'bg-chart-4 text-chart-4-foreground',
    sales_manager: 'bg-chart-1 text-primary-foreground',
    sales: 'bg-chart-2 text-primary-foreground',
    pm: 'bg-chart-3 text-primary-foreground',
    developer: 'bg-chart-5 text-primary-foreground',
  }
  return colors[role]
}
