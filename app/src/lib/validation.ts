import { z } from 'zod'

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  orgName: z.string().min(1, 'Organization name is required').optional(),
  subdomain: z.string().min(3, 'Subdomain must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Subdomain must be lowercase alphanumeric with hyphens').optional(),
  inviteCode: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Person schemas
export const createPersonSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').optional().nullable(),
  phone: z.string().optional().nullable(),
  photoUrl: z.string().url('Invalid URL').optional().nullable(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive']).default('active'),
})

export const updatePersonSchema = createPersonSchema.partial()

// Service Plan schemas
export const createServicePlanSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  date: z.string().datetime('Invalid date'),
  campus: z.string().optional().nullable(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  notes: z.string().optional().nullable(),
})

export const updateServicePlanSchema = createServicePlanSchema.partial()

// Service Item schemas
export const createServiceItemSchema = z.object({
  servicePlanId: z.string().cuid(),
  type: z.enum(['song', 'element', 'note']),
  title: z.string().min(1, 'Title is required'),
  durationSec: z.number().int().min(0).default(0),
  position: z.number().int().min(0),
  notes: z.string().optional().nullable(),
})

export const updateServiceItemSchema = createServiceItemSchema.partial().omit({ servicePlanId: true })

// Service Assignment schemas
export const createServiceAssignmentSchema = z.object({
  servicePlanId: z.string().cuid(),
  personId: z.string().cuid(),
  role: z.string().min(1, 'Role is required'),
})

export const updateServiceAssignmentStatusSchema = z.object({
  status: z.enum(['pending', 'accepted', 'declined']),
})

// Group schemas
export const createGroupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
  cadence: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  isOpen: z.boolean().default(true),
})

export const updateGroupSchema = createGroupSchema.partial()

// Group Membership schemas
export const addGroupMemberSchema = z.object({
  personId: z.string().cuid(),
  role: z.enum(['leader', 'member']).default('member'),
})

// Group Comment schemas
export const createGroupCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
})

// Organization schemas
export const updateOrgSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  logoUrl: z.string().url('Invalid URL').optional().nullable(),
  timezone: z.string().optional(),
  campus: z.string().optional().nullable(),
})

// User management schemas
export const createInviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'leader', 'member', 'viewer']).default('member'),
})

export const updateUserRoleSchema = z.object({
  role: z.enum(['admin', 'leader', 'member', 'viewer']),
})
