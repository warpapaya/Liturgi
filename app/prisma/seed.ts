import { PrismaClient } from '@prisma/client'
import argon2 from 'argon2'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo organization
  const org = await prisma.organization.upsert({
    where: { subdomain: 'demo' },
    update: {},
    create: {
      name: 'Demo Church',
      subdomain: 'demo',
      plan: 'trial',
      planLimits: {
        people: 100,
        groups: 10,
        servicePlans: 10,
      },
      trialEndAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      timezone: 'America/New_York',
      campus: 'Main Campus',
    },
  })
  console.log('✓ Organization created:', org.name)

  // Create admin user
  const passwordHash = await argon2.hash('Password123!', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  })

  const admin = await prisma.user.upsert({
    where: { id: 'admin-demo' },
    update: {},
    create: {
      id: 'admin-demo',
      orgId: org.id,
      email: 'admin@demo.church',
      passwordHash,
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
    },
  })
  console.log('✓ Admin user created:', admin.email, '(password: Password123!)')

  // Create demo people
  const peopleData = [
    { firstName: 'John', lastName: 'Smith', email: 'john.smith@example.com', phone: '555-0101', tags: ['Volunteer', 'Music'] },
    { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@example.com', phone: '555-0102', tags: ['Leader', 'Youth'] },
    { firstName: 'Michael', lastName: 'Williams', email: 'mwilliams@example.com', phone: '555-0103', tags: ['Tech', 'Video'] },
    { firstName: 'Emily', lastName: 'Brown', email: 'emily.b@example.com', phone: '555-0104', tags: ['Music', 'Worship'] },
    { firstName: 'David', lastName: 'Jones', email: 'djones@example.com', phone: '555-0105', tags: ['Leader'] },
    { firstName: 'Jessica', lastName: 'Garcia', email: 'jgarcia@example.com', phone: '555-0106', tags: ['Volunteer'] },
    { firstName: 'Daniel', lastName: 'Martinez', email: 'dmartinez@example.com', phone: '555-0107', tags: ['Tech', 'Audio'] },
    { firstName: 'Ashley', lastName: 'Rodriguez', email: 'arodriguez@example.com', phone: '555-0108', tags: ['Youth', 'Leader'] },
    { firstName: 'Christopher', lastName: 'Wilson', email: 'cwilson@example.com', phone: '555-0109', tags: ['Music'] },
    { firstName: 'Amanda', lastName: 'Anderson', email: 'aanderson@example.com', phone: '555-0110', tags: ['Volunteer', 'Hospitality'] },
    { firstName: 'Matthew', lastName: 'Thomas', email: 'mthomas@example.com', phone: '555-0111', tags: ['Leader', 'Small Groups'] },
    { firstName: 'Jennifer', lastName: 'Taylor', email: 'jtaylor@example.com', phone: '555-0112', tags: ['Volunteer'] },
  ]

  const people = []
  for (const personData of peopleData) {
    const person = await prisma.person.create({
      data: {
        ...personData,
        orgId: org.id,
        status: 'active',
      },
    })
    people.push(person)
  }
  console.log(`✓ Created ${people.length} people`)

  // Create demo groups
  const group1 = await prisma.group.create({
    data: {
      orgId: org.id,
      name: 'Worship Team',
      description: 'Sunday morning worship team and musicians',
      cadence: 'Weekly on Sundays',
      location: 'Sanctuary',
      isOpen: false,
    },
  })

  const group2 = await prisma.group.create({
    data: {
      orgId: org.id,
      name: 'Tech Team',
      description: 'Audio, video, and lighting volunteers',
      cadence: 'Rotating schedule',
      location: 'Tech Booth',
      isOpen: true,
    },
  })

  console.log('✓ Created 2 groups')

  // Add group members
  await prisma.groupMembership.createMany({
    data: [
      { groupId: group1.id, personId: people[0].id, role: 'member' },
      { groupId: group1.id, personId: people[1].id, role: 'leader' },
      { groupId: group1.id, personId: people[3].id, role: 'member' },
      { groupId: group1.id, personId: people[8].id, role: 'member' },
      { groupId: group2.id, personId: people[2].id, role: 'leader' },
      { groupId: group2.id, personId: people[6].id, role: 'member' },
    ],
  })
  console.log('✓ Added group members')

  // Create demo service plans
  const today = new Date()
  const nextSunday = new Date(today)
  nextSunday.setDate(today.getDate() + ((7 - today.getDay()) % 7))

  const service1 = await prisma.servicePlan.create({
    data: {
      orgId: org.id,
      name: 'Sunday Morning Worship',
      date: nextSunday,
      campus: 'Main Campus',
      notes: 'Theme: Grace and Mercy',
    },
  })

  const nextNextSunday = new Date(nextSunday)
  nextNextSunday.setDate(nextNextSunday.getDate() + 7)

  const service2 = await prisma.servicePlan.create({
    data: {
      orgId: org.id,
      name: 'Sunday Morning Worship',
      date: nextNextSunday,
      campus: 'Main Campus',
      notes: 'Theme: Hope and Faith',
    },
  })

  console.log('✓ Created 2 service plans')

  // Add service items
  await prisma.serviceItem.createMany({
    data: [
      {
        servicePlanId: service1.id,
        type: 'song',
        title: 'Welcome & Opening Prayer',
        durationSec: 180,
        position: 0,
      },
      {
        servicePlanId: service1.id,
        type: 'song',
        title: 'Worship Song 1',
        durationSec: 300,
        position: 1,
        notes: 'Key of G',
      },
      {
        servicePlanId: service1.id,
        type: 'song',
        title: 'Worship Song 2',
        durationSec: 360,
        position: 2,
        notes: 'Key of D',
      },
      {
        servicePlanId: service1.id,
        type: 'element',
        title: 'Announcements',
        durationSec: 240,
        position: 3,
      },
      {
        servicePlanId: service1.id,
        type: 'element',
        title: 'Offering',
        durationSec: 300,
        position: 4,
      },
      {
        servicePlanId: service1.id,
        type: 'element',
        title: 'Message',
        durationSec: 1800,
        position: 5,
        notes: 'Pastor John speaking on Grace',
      },
      {
        servicePlanId: service1.id,
        type: 'song',
        title: 'Closing Song',
        durationSec: 240,
        position: 6,
      },
    ],
  })
  console.log('✓ Added service items')

  // Add service assignments
  await prisma.serviceAssignment.createMany({
    data: [
      { servicePlanId: service1.id, personId: people[0].id, role: 'Acoustic Guitar', status: 'accepted' },
      { servicePlanId: service1.id, personId: people[3].id, role: 'Vocals', status: 'accepted' },
      { servicePlanId: service1.id, personId: people[2].id, role: 'Camera 1', status: 'pending' },
      { servicePlanId: service1.id, personId: people[6].id, role: 'Audio', status: 'accepted' },
      { servicePlanId: service2.id, personId: people[8].id, role: 'Keys', status: 'pending' },
    ],
  })
  console.log('✓ Added service assignments')

  // Add audit log entries
  await prisma.auditLog.create({
    data: {
      orgId: org.id,
      userId: admin.id,
      action: 'created',
      entity: 'Organization',
      entityId: org.id,
      diff: { message: 'Initial seed data created' },
    },
  })

  console.log('✅ Seeding completed successfully!')
  console.log('\nDemo credentials:')
  console.log('  Email: admin@demo.church')
  console.log('  Password: Password123!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
