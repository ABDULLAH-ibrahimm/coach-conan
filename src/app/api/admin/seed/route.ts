import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }
  try {
    // Check if database already has data
    const clientCount = await db.client.count()
    const sessionCount = await db.session.count()
    const testimonialCount = await db.testimonial.count()

    if (clientCount > 0 || sessionCount > 0 || testimonialCount > 0) {
      return NextResponse.json({
        message: 'Database already has data. Seeding skipped.',
        counts: { clients: clientCount, sessions: sessionCount, testimonials: testimonialCount },
      })
    }

    // Create admin if not exists
    const existingAdmin = await db.admin.findFirst()
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Admin@CoachConan2024!', 12)
      await db.admin.create({
        data: {
          email: 'admin@coachconan.com',
          password: hashedPassword,
          name: 'Coach Conan',
        },
      })
    }

    // Create sample clients
    const client1 = await db.client.create({
      data: {
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        phone: '+1-555-0101',
        age: 28,
        weight: 65.5,
        height: 170.0,
        goal: 'Build muscle and improve overall fitness',
        plan: 'Premium Personal Training',
        status: 'active',
        notes: 'Very dedicated client, trains 4 times a week',
        joinDate: new Date('2024-09-15'),
      },
    })

    const client2 = await db.client.create({
      data: {
        name: 'Mike Chen',
        email: 'mike.chen@email.com',
        phone: '+1-555-0102',
        age: 35,
        weight: 82.0,
        height: 178.0,
        goal: 'Weight loss and cardio improvement',
        plan: 'Standard Plan',
        status: 'active',
        notes: 'Prefers morning sessions',
        joinDate: new Date('2024-11-01'),
      },
    })

    const client3 = await db.client.create({
      data: {
        name: 'Emily Rodriguez',
        email: 'emily.r@email.com',
        phone: '+1-555-0103',
        age: 31,
        weight: 58.0,
        height: 165.0,
        goal: 'Prepare for marathon',
        plan: 'Athletic Performance',
        status: 'active',
        notes: 'Training for NYC marathon 2025',
        joinDate: new Date('2025-01-10'),
      },
    })

    // Create sample sessions
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)
    const twoWeeks = new Date(today)
    twoWeeks.setDate(twoWeeks.getDate() + 14)
    const pastDate1 = new Date(today)
    pastDate1.setDate(pastDate1.getDate() - 3)
    const pastDate2 = new Date(today)
    pastDate2.setDate(pastDate2.getDate() - 7)

    await db.session.createMany({
      data: [
        {
          clientId: client1.id,
          date: tomorrow,
          type: 'personal',
          duration: 60,
          notes: 'Upper body strength training',
          status: 'scheduled',
        },
        {
          clientId: client2.id,
          date: nextWeek,
          type: 'personal',
          duration: 45,
          notes: 'Cardio and HIIT session',
          status: 'scheduled',
        },
        {
          clientId: client3.id,
          date: twoWeeks,
          type: 'group',
          duration: 90,
          notes: 'Marathon prep group run',
          status: 'scheduled',
        },
        {
          clientId: client1.id,
          date: pastDate1,
          type: 'personal',
          duration: 60,
          notes: 'Leg day - completed successfully',
          status: 'completed',
        },
        {
          clientId: client2.id,
          date: pastDate2,
          type: 'personal',
          duration: 30,
          notes: 'Client cancelled due to travel',
          status: 'cancelled',
        },
      ],
    })

    // Create sample testimonials
    await db.testimonial.createMany({
      data: [
        {
          name: 'Sarah Johnson',
          role: 'Marketing Executive',
          rating: 5,
          text: 'Coach Conan completely transformed my approach to fitness. His personalized training plans and constant motivation helped me achieve goals I never thought possible. I\'ve gained muscle, lost body fat, and feel more confident than ever!',
          avatar: '',
          comment: '',
          approved: true,
        },
        {
          name: 'Mike Chen',
          role: 'Software Engineer',
          rating: 5,
          text: 'After years of struggling with weight loss on my own, Coach Conan\'s structured program made all the difference. He understands the challenges of a busy professional and designs workouts that fit my schedule. Down 20lbs and counting!',
          avatar: '',
          comment: '',
          approved: true,
        },
        {
          name: 'Emily Rodriguez',
          role: 'Teacher',
          rating: 4,
          text: 'Training with Coach Conan for my marathon prep was the best decision. His knowledge of endurance training and nutrition planning helped me improve my pace significantly. Highly recommend for anyone training for endurance events.',
          avatar: '',
          comment: 'Coach reply: Thank you Emily! You\'re going to crush that marathon!',
          approved: true,
        },
        {
          name: 'David Park',
          role: 'Retired Veteran',
          rating: 5,
          text: 'At 55, I was worried about starting a fitness program. Coach Conan was incredibly patient and designed a plan that respects my limitations while still pushing me to improve. I feel 10 years younger!',
          avatar: '',
          comment: '',
          approved: false,
        },
        {
          name: 'Lisa Thompson',
          role: 'Small Business Owner',
          rating: 4,
          text: 'Great coaching experience overall. Coach Conan is knowledgeable and supportive. The only reason for 4 stars instead of 5 is that I wish there were more group session options available.',
          avatar: '',
          comment: '',
          approved: false,
        },
      ],
    })

    // Create sample contact submissions
    await db.contactSubmission.createMany({
      data: [
        {
          name: 'James Wilson',
          email: 'james.w@email.com',
          phone: '+1-555-0201',
          service: 'Personal Training',
          message: 'I\'m interested in personal training sessions. Could we schedule a consultation?',
          status: 'new',
        },
        {
          name: 'Anna Martinez',
          email: 'anna.m@email.com',
          phone: '+1-555-0202',
          service: 'Nutrition Planning',
          message: 'Looking for a nutrition plan to complement my workout routine. What options do you offer?',
          status: 'read',
        },
        {
          name: 'Robert Lee',
          email: 'robert.l@email.com',
          phone: '+1-555-0203',
          service: 'Group Classes',
          message: 'Do you have any group fitness classes available on weekends?',
          status: 'replied',
        },
      ],
    })

    const finalCounts = {
      clients: await db.client.count(),
      sessions: await db.session.count(),
      testimonials: await db.testimonial.count(),
      submissions: await db.contactSubmission.count(),
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      counts: finalCounts,
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
