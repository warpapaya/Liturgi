import { Role } from '@prisma/client'
import { SessionUser } from './auth'

export type Permission =
  | 'people:read'
  | 'people:write'
  | 'people:delete'
  | 'services:read'
  | 'services:write'
  | 'services:delete'
  | 'groups:read'
  | 'groups:write'
  | 'groups:delete'
  | 'settings:read'
  | 'settings:write'
  | 'users:manage'
  | 'org:manage'

const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    'people:read', 'people:write', 'people:delete',
    'services:read', 'services:write', 'services:delete',
    'groups:read', 'groups:write', 'groups:delete',
    'settings:read', 'settings:write',
    'users:manage', 'org:manage',
  ],
  leader: [
    'people:read', 'people:write',
    'services:read', 'services:write',
    'groups:read', 'groups:write',
    'settings:read',
  ],
  member: [
    'people:read',
    'services:read',
    'groups:read',
    'settings:read',
  ],
  viewer: [
    'people:read',
    'services:read',
    'groups:read',
  ],
}

export function hasPermission(user: SessionUser | null, permission: Permission): boolean {
  if (!user) return false

  const role = user.role as Role
  const permissions = rolePermissions[role] || []

  return permissions.includes(permission)
}

export function requirePermission(user: SessionUser | null, permission: Permission): void {
  if (!hasPermission(user, permission)) {
    throw new Error(`Permission denied: ${permission}`)
  }
}

export function canManageServicePlan(user: SessionUser | null, servicePlanOrgId: string): boolean {
  if (!user) return false
  if (user.orgId !== servicePlanOrgId) return false

  return hasPermission(user, 'services:write')
}

export function canManageGroup(user: SessionUser | null, groupOrgId: string): boolean {
  if (!user) return false
  if (user.orgId !== groupOrgId) return false

  return hasPermission(user, 'groups:write')
}

export function isAdmin(user: SessionUser | null): boolean {
  return user?.role === 'admin'
}

export function isLeaderOrAbove(user: SessionUser | null): boolean {
  if (!user) return false
  return user.role === 'admin' || user.role === 'leader'
}

// Org isolation: ensures all queries are scoped to user's org
export function getOrgFilter(user: SessionUser): { orgId: string } {
  return { orgId: user.orgId }
}
