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
  status: z.enum(['active', 'inactive', 'archived']).default('active'),
  visibility: z.enum(['public', 'private', 'hidden']).default('public'),
  category: z.enum([
    'small_group', 'ministry_team', 'class', 'committee', 'prayer_group',
    'bible_study', 'youth_group', 'kids_group', 'mens_group', 'womens_group',
    'support_group', 'service_team', 'worship_team', 'other'
  ]).default('small_group'),
  capacity: z.number().int().positive().optional().nullable(),
  photoUrl: z.string().url('Invalid photo URL').optional().nullable(),
  meetingDay: z.string().optional().nullable(),
  meetingTime: z.string().optional().nullable(),
  campus: z.string().optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
})

export const updateGroupSchema = createGroupSchema.partial()

// Group Membership schemas
export const addGroupMemberSchema = z.object({
  personId: z.string().cuid(),
  role: z.enum(['leader', 'co_leader', 'member', 'guest']).default('member'),
  status: z.enum(['active', 'invited', 'requested', 'declined']).default('active'),
  notes: z.string().optional().nullable(),
})

export const updateGroupMemberSchema = z.object({
  role: z.enum(['leader', 'co_leader', 'member', 'guest']).optional(),
  status: z.enum(['active', 'invited', 'requested', 'declined']).optional(),
  notes: z.string().optional().nullable(),
})

// Group Comment schemas
export const createGroupCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
})

// Group Meeting schemas
export const createGroupMeetingSchema = z.object({
  groupId: z.string().cuid(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  startTime: z.string().datetime('Invalid start time'),
  endTime: z.string().datetime('Invalid end time').optional().nullable(),
  location: z.string().optional().nullable(),
  isRecurring: z.boolean().default(false),
  notes: z.string().optional().nullable(),
})

export const updateGroupMeetingSchema = createGroupMeetingSchema.partial().omit({ groupId: true })

export const cancelGroupMeetingSchema = z.object({
  isCancelled: z.boolean(),
})

// Group Attendance schemas
export const recordGroupAttendanceSchema = z.object({
  membershipId: z.string().cuid(),
  attended: z.boolean(),
  notes: z.string().optional().nullable(),
})

export const bulkRecordAttendanceSchema = z.object({
  attendanceRecords: z.array(z.object({
    membershipId: z.string().cuid(),
    attended: z.boolean(),
    notes: z.string().optional().nullable(),
  })),
})

// Group Resource schemas
export const createGroupResourceSchema = z.object({
  groupId: z.string().cuid(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  type: z.enum(['document', 'video', 'audio', 'link', 'curriculum']),
  url: z.string().url('Invalid URL').optional().nullable(),
  fileUrl: z.string().url('Invalid file URL').optional().nullable(),
})

export const updateGroupResourceSchema = createGroupResourceSchema.partial().omit({ groupId: true })

// Group Prayer Request schemas
export const createGroupPrayerRequestSchema = z.object({
  groupId: z.string().cuid(),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  isPrivate: z.boolean().default(false),
})

export const updateGroupPrayerRequestSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  isAnswered: z.boolean().optional(),
  isPrivate: z.boolean().optional(),
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
