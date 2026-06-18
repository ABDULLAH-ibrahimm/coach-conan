import { db } from './src/lib/db'
import bcrypt from 'bcryptjs'

async function seed() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const existingAdmin = await db.admin.findUnique({ where: { email: 'admin@coachconan.com' } })
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 12)
    await db.admin.create({
      data: {
        email: 'admin@coachconan.com',
        password: hashedPassword,
        name: 'Coach Conan',
      },
    })
    console.log('✅ Admin user created')
  } else {
    console.log('ℹ️ Admin user already exists')
  }

  // Create sample clients
  const clientCount = await db.client.count()
  if (clientCount === 0) {
    const clients = await db.client.createMany({
      data: [
        { name: 'Ahmed Hassan', email: 'ahmed@email.com', phone: '+201012345678', age: 28, weight: 85, height: 178, goal: 'Fat Loss', plan: 'Body Transformation', status: 'active', notes: 'Started 3 months ago' },
        { name: 'Sara Mohamed', email: 'sara@email.com', phone: '+201098765432', age: 24, weight: 62, height: 165, goal: 'Muscle Building', plan: 'Personal Training', status: 'active', notes: 'Very dedicated client' },
        { name: 'Omar Ali', email: 'omar@email.com', phone: '+201155544433', age: 32, weight: 95, height: 182, goal: 'Fat Loss', plan: 'Online Coaching', status: 'active', notes: 'Online client from Alex' },
        { name: 'Nour El-Din', email: 'nour@email.com', phone: '+201122334455', age: 26, weight: 75, height: 175, goal: 'Strength', plan: 'Personal Training', status: 'active', notes: 'Focus on compound lifts' },
        { name: 'Fatima Ahmed', email: 'fatima@email.com', phone: '+201133445566', age: 30, weight: 68, height: 160, goal: 'Toning', plan: 'Nutrition Planning', status: 'inactive', notes: 'Paused for 2 months' },
        { name: 'Youssef Khaled', email: 'youssef@email.com', phone: '+201144556677', age: 22, weight: 70, height: 180, goal: 'Muscle Building', plan: 'Body Transformation', status: 'active', notes: 'College student' },
        { name: 'Layla Ibrahim', email: 'layla@email.com', phone: '+201155667788', age: 35, weight: 72, height: 170, goal: 'General Fitness', plan: 'Online Coaching', status: 'active', notes: 'Mother of 2' },
        { name: 'Karim Mostafa', email: 'karim@email.com', phone: '+201166778899', age: 29, weight: 88, height: 185, goal: 'Fat Loss', plan: 'Personal Training', status: 'inactive', notes: 'Relocated abroad' },
      ],
    })
    console.log(`✅ Created ${clients.count} clients`)
  }

  // Create sample sessions
  const sessionCount = await db.session.count()
  if (sessionCount === 0) {
    const allClients = await db.client.findMany()
    if (allClients.length > 0) {
      const sessionsData = []
      const types = ['personal', 'online', 'group', 'consultation']
      const statuses = ['scheduled', 'completed', 'cancelled']
      const now = new Date()
      
      for (const client of allClients) {
        // 3-5 sessions per client
        const numSessions = 3 + Math.floor(Math.random() * 3)
        for (let i = 0; i < numSessions; i++) {
          const date = new Date(now)
          date.setDate(date.getDate() + (i - 2) * 3)
          date.setHours(9 + Math.floor(Math.random() * 10), 0, 0, 0)
          sessionsData.push({
            clientId: client.id,
            date,
            type: types[Math.floor(Math.random() * types.length)],
            duration: [45, 60, 90][Math.floor(Math.random() * 3)],
            notes: '',
            status: i < 2 ? statuses[Math.floor(Math.random() * statuses.length)] : 'scheduled',
          })
        }
      }
      await db.session.createMany({ data: sessionsData })
      console.log(`✅ Created ${sessionsData.length} sessions`)
    }
  }

  // Create sample testimonials
  const testimonialCount = await db.testimonial.count()
  if (testimonialCount === 0) {
    await db.testimonial.createMany({
      data: [
        { name: 'Ahmed Hassan', role: 'Body Transformation Client', rating: 5, text: 'Coach Conan completely changed my life! Lost 20kg in 12 weeks with his incredible program. His dedication and expertise are unmatched.', approved: true },
        { name: 'Sara Mohamed', role: 'Personal Training Client', rating: 5, text: 'Best investment I ever made. Coach Conan pushes you just enough and always keeps things interesting. Never had a boring session!', approved: true },
        { name: 'Omar Ali', role: 'Online Coaching Client', rating: 5, text: 'Even though I am in Alexandria, the online coaching feels just as personal. The weekly check-ins and plan adjustments are spot on.', approved: true },
        { name: 'Nour El-Din', role: 'Personal Training Client', rating: 4, text: 'Great trainer with solid knowledge of strength training. My deadlift went from 80kg to 140kg in 6 months!', approved: true },
        { name: 'Youssef Khaled', role: 'Body Transformation Client', rating: 5, text: 'Started as a skinny college kid and now I am the fittest guy in my group. Coach Conan knows his stuff!', approved: false },
        { name: 'Layla Ibrahim', role: 'Online Coaching Client', rating: 4, text: 'As a busy mom, the flexible scheduling and online coaching has been a game changer. Finally getting back in shape!', approved: false },
      ],
    })
    console.log('✅ Created testimonials')
  }

  // Create sample contact submissions
  const submissionCount = await db.contactSubmission.count()
  if (submissionCount === 0) {
    await db.contactSubmission.createMany({
      data: [
        { name: 'Mohamed Salah', email: 'mosalah@email.com', phone: '+201199887766', service: 'Personal Training', message: 'Hi, I am interested in personal training sessions. What are your rates and available times?', status: 'new' },
        { name: 'Amira Fathy', email: 'amira@email.com', phone: '+201188776655', service: 'Online Coaching', message: 'I live in Dubai but want to train with you online. Is that possible?', status: 'read' },
        { name: 'Hassan Youssef', email: 'hassan@email.com', phone: '+201177665544', service: 'Body Transformation', message: 'I need to lose 30kg. Can your 12-week program help me?', status: 'replied' },
        { name: 'Dina Adel', email: 'dina@email.com', phone: '+201166554433', service: 'Nutrition Planning', message: 'Looking for a personalized meal plan. I have some dietary restrictions.', status: 'new' },
        { name: 'Tarek Mansour', email: 'tarek@email.com', phone: '+201155443322', service: 'Personal Training', message: 'What is the difference between personal training and online coaching?', status: 'new' },
      ],
    })
    console.log('✅ Created contact submissions')
  }

  console.log('🎉 Seeding complete!')
}

seed()
  .catch(console.error)
  .finally(() => db.$disconnect())
