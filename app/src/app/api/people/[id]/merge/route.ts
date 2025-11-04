import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'

// POST /api/people/:id/merge - Merge duplicate people
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'people:write')

    const { mergeIntoId } = await req.json()

    if (!mergeIntoId) {
      return NextResponse.json(
        { error: 'mergeIntoId is required' },
        { status: 400 }
      )
    }

    // Get both people
    const [personToMerge, targetPerson] = await Promise.all([
      prisma.person.findFirst({
        where: { id: params.id, ...getOrgFilter(user) },
        include: {
          phoneNumbers: true,
          emailAddresses: true,
          addresses: true,
          emergencyContacts: true,
          customFieldValues: true,
          personTags: true,
          notes: true,
        },
      }),
      prisma.person.findFirst({
        where: { id: mergeIntoId, ...getOrgFilter(user) },
      }),
    ])

    if (!personToMerge || !targetPerson) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      )
    }

    // Merge data in a transaction
    await prisma.$transaction(async (tx) => {
      // Update target person with merged data
      const mergedFrom = Array.isArray(targetPerson.mergedFrom)
        ? [...(targetPerson.mergedFrom as string[]), params.id]
        : [params.id]

      await tx.person.update({
        where: { id: mergeIntoId },
        data: {
          mergedFrom,
          // Keep existing data but fill in missing fields
          middleName: targetPerson.middleName || personToMerge.middleName,
          nickname: targetPerson.nickname || personToMerge.nickname,
          birthDate: targetPerson.birthDate || personToMerge.birthDate,
          anniversary: targetPerson.anniversary || personToMerge.anniversary,
          photoUrl: targetPerson.photoUrl || personToMerge.photoUrl,
          gender: targetPerson.gender || personToMerge.gender,
        },
      })

      // Transfer all related records
      await Promise.all([
        // Phone numbers
        ...personToMerge.phoneNumbers.map((phone) =>
          tx.personPhone.updateMany({
            where: { id: phone.id },
            data: { personId: mergeIntoId },
          })
        ),
        // Emails
        ...personToMerge.emailAddresses.map((email) =>
          tx.personEmail.updateMany({
            where: { id: email.id },
            data: { personId: mergeIntoId },
          })
        ),
        // Addresses
        ...personToMerge.addresses.map((address) =>
          tx.personAddress.updateMany({
            where: { id: address.id },
            data: { personId: mergeIntoId },
          })
        ),
        // Emergency contacts
        ...personToMerge.emergencyContacts.map((contact) =>
          tx.emergencyContact.updateMany({
            where: { id: contact.id },
            data: { personId: mergeIntoId },
          })
        ),
        // Custom fields (avoiding duplicates)
        ...personToMerge.customFieldValues.map(async (field) => {
          const existing = await tx.customFieldValue.findUnique({
            where: {
              personId_fieldId: {
                personId: mergeIntoId,
                fieldId: field.fieldId,
              },
            },
          })
          if (!existing) {
            return tx.customFieldValue.updateMany({
              where: { id: field.id },
              data: { personId: mergeIntoId },
            })
          }
        }),
        // Tags (avoiding duplicates)
        ...personToMerge.personTags.map(async (tag) => {
          const existing = await tx.personTag.findUnique({
            where: {
              personId_tagId: {
                personId: mergeIntoId,
                tagId: tag.tagId,
              },
            },
          })
          if (!existing) {
            return tx.personTag.updateMany({
              where: { id: tag.id },
              data: { personId: mergeIntoId },
            })
          } else {
            // Delete duplicate
            return tx.personTag.delete({ where: { id: tag.id } })
          }
        }),
        // Notes
        ...personToMerge.notes.map((note) =>
          tx.personNote.updateMany({
            where: { id: note.id },
            data: { personId: mergeIntoId },
          })
        ),
        // Group memberships
        tx.groupMembership.updateMany({
          where: { personId: params.id },
          data: { personId: mergeIntoId },
        }),
        // Service assignments
        tx.serviceAssignment.updateMany({
          where: { personId: params.id },
          data: { personId: mergeIntoId },
        }),
        // Attendance records
        tx.attendanceRecord.updateMany({
          where: { personId: params.id },
          data: { personId: mergeIntoId },
        }),
      ])

      // Delete the merged person
      await tx.person.delete({ where: { id: params.id } })
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        action: 'merged',
        entity: 'Person',
        entityId: params.id,
        diff: { mergedInto: mergeIntoId },
      },
    })

    return NextResponse.json({ success: true, mergedIntoId })
  } catch (error) {
    console.error('Merge person error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to merge person' },
      { status: 500 }
    )
  }
}
