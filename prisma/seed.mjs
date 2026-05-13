// Seed script — Creates demo users, projects, and tasks
// Run: node prisma/seed.mjs

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Clean existing data
  await prisma.activity.deleteMany();
  await prisma.task.deleteMany();
  await prisma.member.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create Admin user
  const adminPassword = await bcrypt.hash('Admin123@', 12);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@test.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Created admin:', admin.email);

  // Create Member user
  const memberPassword = await bcrypt.hash('Member123@', 12);
  const member = await prisma.user.create({
    data: {
      name: 'Member User',
      email: 'member@test.com',
      password: memberPassword,
      role: 'MEMBER',
    },
  });
  console.log('✅ Created member:', member.email);

  // Create extra team members
  const sarah = await prisma.user.create({
    data: {
      name: 'Sarah Wilson',
      email: 'sarah@test.com',
      password: await bcrypt.hash('Sarah123@', 12),
      role: 'MEMBER',
    },
  });

  const james = await prisma.user.create({
    data: {
      name: 'James Brown',
      email: 'james@test.com',
      password: await bcrypt.hash('James123@', 12),
      role: 'MEMBER',
    },
  });
  console.log('✅ Created additional team members');

  // Create Project 1: Website Redesign
  const project1 = await prisma.project.create({
    data: {
      title: 'Website Redesign',
      description: 'Complete overhaul of the company website with modern design, improved UX, and mobile responsiveness.',
      createdById: admin.id,
      members: {
        create: [
          { userId: admin.id, role: 'ADMIN' },
          { userId: member.id, role: 'MEMBER' },
          { userId: sarah.id, role: 'MEMBER' },
        ],
      },
    },
  });

  // Create tasks for Project 1
  const now = new Date();
  const tasks1 = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Design homepage mockup',
        description: 'Create a modern, responsive homepage design using Figma.',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        projectId: project1.id,
        assignedToId: sarah.id,
        createdById: admin.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implement navigation component',
        description: 'Build responsive navbar with mobile hamburger menu.',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        projectId: project1.id,
        assignedToId: member.id,
        createdById: admin.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Set up CI/CD pipeline',
        description: 'Configure GitHub Actions for automatic deployment to staging.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        projectId: project1.id,
        assignedToId: member.id,
        createdById: admin.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Create about page',
        description: 'Design and implement the about page with team section.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
        projectId: project1.id,
        assignedToId: sarah.id,
        createdById: admin.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'SEO optimization',
        description: 'Add meta tags, structured data, and optimize page load speed.',
        status: 'TODO',
        priority: 'LOW',
        dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        projectId: project1.id,
        assignedToId: null,
        createdById: admin.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Fix mobile layout bugs',
        description: 'Address layout issues on iOS Safari and Android Chrome.',
        status: 'TODO',
        priority: 'HIGH',
        dueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // overdue!
        projectId: project1.id,
        assignedToId: member.id,
        createdById: admin.id,
      },
    }),
  ]);
  console.log(`✅ Created ${tasks1.length} tasks for "${project1.title}"`);

  // Create Project 2: Mobile App
  const project2 = await prisma.project.create({
    data: {
      title: 'Mobile App Development',
      description: 'Native mobile application for iOS and Android with real-time notifications and offline support.',
      createdById: admin.id,
      members: {
        create: [
          { userId: admin.id, role: 'ADMIN' },
          { userId: james.id, role: 'MEMBER' },
          { userId: member.id, role: 'MEMBER' },
        ],
      },
    },
  });

  const tasks2 = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Set up React Native project',
        description: 'Initialize project with TypeScript, navigation, and state management.',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        projectId: project2.id,
        assignedToId: james.id,
        createdById: admin.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Build authentication screens',
        description: 'Login, signup, and forgot password screens with form validation.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        projectId: project2.id,
        assignedToId: james.id,
        createdById: admin.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Design app icon and splash screen',
        description: 'Create brand-consistent app icon in all required sizes.',
        status: 'TODO',
        priority: 'LOW',
        dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        projectId: project2.id,
        assignedToId: null,
        createdById: admin.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implement push notifications',
        description: 'Set up Firebase Cloud Messaging for push notifications.',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        projectId: project2.id,
        assignedToId: member.id,
        createdById: admin.id,
      },
    }),
  ]);
  console.log(`✅ Created ${tasks2.length} tasks for "${project2.title}"`);

  // Create Project 3: API Integration
  const project3 = await prisma.project.create({
    data: {
      title: 'API Integration Suite',
      description: 'Third-party API integrations including payment gateway, analytics, and CRM sync.',
      createdById: member.id,
      members: {
        create: [
          { userId: member.id, role: 'ADMIN' },
          { userId: sarah.id, role: 'MEMBER' },
        ],
      },
    },
  });

  const tasks3 = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Stripe payment integration',
        description: 'Implement Stripe checkout and subscription billing.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        projectId: project3.id,
        assignedToId: member.id,
        createdById: member.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Google Analytics setup',
        description: 'Add GA4 tracking with custom events and conversion goals.',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
        projectId: project3.id,
        assignedToId: sarah.id,
        createdById: member.id,
      },
    }),
  ]);
  console.log(`✅ Created ${tasks3.length} tasks for "${project3.title}"`);

  // Create activity logs
  await prisma.activity.createMany({
    data: [
      { type: 'PROJECT_CREATED', message: 'created project "Website Redesign"', userId: admin.id, projectId: project1.id },
      { type: 'MEMBER_ADDED', message: 'added Member User to the project', userId: admin.id, projectId: project1.id },
      { type: 'TASK_CREATED', message: 'created task "Design homepage mockup"', userId: admin.id, projectId: project1.id, taskId: tasks1[0].id },
      { type: 'STATUS_CHANGED', message: 'moved "Design homepage mockup" to Done', userId: sarah.id, projectId: project1.id, taskId: tasks1[0].id },
      { type: 'STATUS_CHANGED', message: 'moved "Implement navigation" to Done', userId: member.id, projectId: project1.id, taskId: tasks1[1].id },
      { type: 'TASK_CREATED', message: 'created task "Set up CI/CD pipeline"', userId: admin.id, projectId: project1.id, taskId: tasks1[2].id },
      { type: 'PROJECT_CREATED', message: 'created project "Mobile App Development"', userId: admin.id, projectId: project2.id },
      { type: 'TASK_CREATED', message: 'created task "Build authentication screens"', userId: admin.id, projectId: project2.id, taskId: tasks2[1].id },
      { type: 'PROJECT_CREATED', message: 'created project "API Integration Suite"', userId: member.id, projectId: project3.id },
      { type: 'TASK_CREATED', message: 'created task "Stripe payment integration"', userId: member.id, projectId: project3.id, taskId: tasks3[0].id },
    ],
  });
  console.log('✅ Created activity logs');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📧 Demo Accounts:');
  console.log('   Admin: admin@test.com / Admin123@');
  console.log('   Member: member@test.com / Member123@');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
