import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// GET /api/organization/settings - Get organization settings
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: user.orgId },
      select: {
        id: true,
        name: true,
        subdomain: true,
        customDomain: true,
        plan: true,
        planLimits: true,
        trialEndAt: true,
        logoUrl: true,
        timezone: true,
        dateFormat: true,
        timeFormat: true,
        locale: true,
        campus: true,
        campuses: true,
        customFields: true,
        settings: true,
        brandingColors: true,
        emailFromName: true,
        emailFromAddress: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Error fetching organization settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization settings' },
      { status: 500 }
    );
  }
}

const updateOrgSettingsSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  logoUrl: z.string().url().optional().nullable(),
  timezone: z.string().optional(),
  dateFormat: z.string().optional(),
  timeFormat: z.enum(['12h', '24h']).optional(),
  locale: z.string().optional(),
  campus: z.string().optional().nullable(),
  campuses: z.array(z.object({
    id: z.string(),
    name: z.string(),
    address: z.string().optional(),
    isDefault: z.boolean().optional(),
  })).optional(),
  customFields: z.record(z.any()).optional(),
  settings: z.record(z.any()).optional(),
  brandingColors: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
    accent: z.string().optional(),
  }).optional().nullable(),
  emailFromName: z.string().optional().nullable(),
  emailFromAddress: z.string().email().optional().nullable(),
});

// PATCH /api/organization/settings - Update organization settings
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permission
    if (!hasPermission(user.role, 'update:org')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateOrgSettingsSchema.parse(body);

    const updatedOrg = await prisma.organization.update({
      where: { id: user.orgId },
      data: validatedData,
      select: {
        id: true,
        name: true,
        subdomain: true,
        customDomain: true,
        logoUrl: true,
        timezone: true,
        dateFormat: true,
        timeFormat: true,
        locale: true,
        campus: true,
        campuses: true,
        customFields: true,
        settings: true,
        brandingColors: true,
        updatedAt: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        action: 'updated',
        entity: 'Organization',
        entityId: user.orgId,
        diff: validatedData,
      },
    });

    return NextResponse.json(updatedOrg);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating organization settings:', error);
    return NextResponse.json(
      { error: 'Failed to update organization settings' },
      { status: 500 }
    );
  }
}
