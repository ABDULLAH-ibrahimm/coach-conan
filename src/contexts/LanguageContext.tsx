'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

type Language = 'en' | 'ar'

interface LanguageContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: string) => string
  dir: 'ltr' | 'rtl'
  currency: string
  formatPrice: (price: number) => string
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.services': 'Services',
    'nav.achievements': 'Achievements',
    'nav.testimonials': 'Testimonials',
    'nav.contact': 'Contact',
    'nav.bookNow': 'Book Now',
    'nav.admin': 'Coach Panel',
    'nav.clientPortal': 'Client Portal',
    'nav.clients': 'Clients',
    'nav.logout': 'Logout',
    'nav.login': 'Login',

    // Hero
    'hero.badge': 'Online Coaching',
    'hero.title1': 'Transform Your',
    'hero.title2': 'Body & Mind',
    'hero.desc': "Cairo's elite trainer. 10+ years transforming bodies through online coaching & in-person training.",
    'hero.cta1': 'Start Your Journey',
    'hero.cta2': 'View Programs',
    'hero.follow': 'Follow Coach Conan',
    'hero.scroll': 'Scroll',
    'hero.yearsExp': 'Years Exp.',
    'hero.followers': 'Followers',
    'hero.results': 'Results',

    // About
    'about.subtitle': 'My Story',
    'about.title': 'About Coach Conan',
    'about.badge': "Cairo's Premier Fitness Coach",
    'about.heading': 'Transforming Lives Through Fitness',
    'about.p1': "Certified personal trainer based in Cairo with 10+ years of experience.\tHelped hundreds of clients achieve their dream physique.",
    'about.p2': 'Expert in body transformations, strength training & nutrition. Simple philosophy: every body is different, every program should be too.',
    'about.p3': '14,000+ Instagram followers. One of Egypt\'s most trusted coaches — online or in-person, same energy and results every time.',
    'about.scienceBased': 'Science-Based Training',
    'about.certifiedPro': 'Certified Professional',
    'about.journey': 'My Journey',
    'about.stat.years': 'Years of Experience',
    'about.stat.clients': 'Clients Trained',
    'about.stat.success': 'Success Rate',
    'about.stat.satisfaction': 'Client Satisfaction',
    'about.m1.title': 'Started Fitness Journey',
    'about.m1.desc': 'Began personal training career in Cairo, dedicating life to fitness and health.',
    'about.m2.title': 'Certified Personal Trainer',
    'about.m2.desc': 'Earned professional certification, solidifying expertise in strength and conditioning.',
    'about.m3.title': 'Joined FitHub Gym',
    'about.m3.desc': "Became a lead trainer at FitHub Gym, one of Cairo's premier fitness centers.",
    'about.m4.title': 'Launched Online Coaching',
    'about.m4.desc': 'Expanded reach globally with online coaching programs, helping clients worldwide.',
    'about.m5.title': '14K+ Instagram Community',
    'about.m5.desc': 'Built a thriving fitness community sharing workout tips, transformations, and motivation.',
    'about.m6.title': 'Elite Transformation Coach',
    'about.m6.desc': "Recognized as one of Cairo's top transformation specialists with proven results.",

    // Services
    'services.subtitle': 'What I Offer',
    'services.title': 'Training Programs',
    'services.desc': 'Every program is built around your unique goals, schedule, and preferences. No cookie-cutter plans — just real results.',
    'services.popular': 'MOST POPULAR',
    'services.s1.title': 'Personal Training',
    'services.s1.desc': 'One-on-one training sessions at FitHub Gym with customized workout programs designed specifically for your body type and fitness goals.',
    'services.s1.f1': 'Custom workout programs',
    'services.s1.f2': 'Form correction & guidance',
    'services.s1.f3': 'Progress tracking',
    'services.s1.f4': 'Flexible scheduling',
    'services.s2.title': 'Online Coaching',
    'services.s2.desc': 'Transform your body from anywhere in the world with our comprehensive online coaching program. Get the same results with virtual guidance.',
    'services.s2.f1': 'Weekly video consultations',
    'services.s2.f2': 'Custom training plans',
    'services.s2.f3': 'Nutrition guidance',
    'services.s2.f4': '24/7 WhatsApp support',
    'services.s3.title': 'Nutrition Planning',
    'services.s3.desc': 'Science-based nutrition plans tailored to your lifestyle, preferences, and goals. No generic diets — only what works for YOU.',
    'services.s3.f1': 'Personalized meal plans',
    'services.s3.f2': 'Macro tracking guidance',
    'services.s3.f3': 'Supplement advice',
    'services.s3.f4': 'Recipe suggestions',
    'services.s4.title': 'Body Transformation',
    'services.s4.desc': 'Our signature 12-week transformation program designed to completely reshape your physique with a holistic approach to training and nutrition.',
    'services.s4.f1': '12-week structured program',
    'services.s4.f2': 'Before & after tracking',
    'services.s4.f3': 'Weekly check-ins',
    'services.s4.f4': 'Complete lifestyle overhaul',
    'services.getStarted': 'Get Started',
    'services.process.subtitle': 'The Process',
    'services.process.title': 'How It Works',
    'services.step1.title': 'Consultation',
    'services.step1.desc': 'Free consultation to understand your goals, current fitness level, and lifestyle.',
    'services.step2.title': 'Custom Plan',
    'services.step2.desc': 'A personalized training and nutrition plan designed specifically for you.',
    'services.step3.title': 'Execute',
    'services.step3.desc': 'Put the plan into action with Coach Conan guiding you every step of the way.',
    'services.step4.title': 'Transform',
    'services.step4.desc': 'See real results with ongoing adjustments and support to ensure success.',

    // Certificates
    'certs.subtitle': 'Qualifications',
    'certs.title': 'Certificates & Achievements',
    'certs.desc': 'Continuously learning and evolving to provide the best training experience backed by science and certified expertise.',
    'certs.certified': 'Certified since',
    'certs.banner.title': 'Committed to Excellence',
    'certs.banner.desc': 'Every certification represents a commitment to providing you with the most effective, science-backed training methods available.',
    'certs.a1': 'Professional Certifications',
    'certs.a2': 'Years in Fitness Industry',
    'certs.a3': 'Social Media Followers',
    'certs.a4': 'Successful Transformations',
    'certs.a5': 'Rated Coach at FitHub Gym',
    'certs.a6': '5-Star Reviews',

    // Testimonials
    'testimonials.subtitle': 'Testimonials',
    'testimonials.title': 'Client Success Stories',
    'testimonials.desc': 'Real people. Real results. Hear from clients who transformed their lives with Coach Conan.',

    // Feedback
    'feedback.title': 'Share Your Experience',
    'feedback.subtitle': 'Your Feedback Matters',
    'feedback.name': 'Your Name',
    'feedback.comment': 'Your Comment',
    'feedback.rating': 'Rating',
    'feedback.submit': 'Submit Feedback',
    'feedback.success': 'Thank you! Your feedback will appear after approval.',
    'feedback.recentFeedback': 'Recent Feedback',
    'feedback.noFeedback': 'No feedback yet. Be the first!',
    'feedback.submitting': 'Submitting...',

    // Contact
    'contact.subtitle': 'Contact Me',
    'contact.title': 'Get In Touch',
    'contact.desc': "Ready to start your transformation? Reach out and let's build the best version of you together.",
    'contact.location': 'Location',
    'contact.phone': 'Phone',
    'contact.email': 'Email',
    'contact.hours': 'Working Hours',
    'contact.connect': 'Connect With Me',
    'contact.form.title': 'Send a Message',
    'contact.form.desc': 'Fill out the form below and Coach Conan will get back to you within 24 hours.',
    'contact.form.name': 'Full Name',
    'contact.form.emailLabel': 'Email',
    'contact.form.phoneLabel': 'Phone',
    'contact.form.interested': 'Interested In',
    'contact.form.selectService': 'Select a service',
    'contact.form.messageLabel': 'Message',
    'contact.form.send': 'Send Message',
    'contact.form.sending': 'Sending...',
    'contact.form.success': 'Message Sent!',
    'contact.form.successDesc': 'Coach Conan will get back to you soon.',
    'contact.chatWhatsApp': 'Chat on WhatsApp',

    // Footer
    'footer.desc': "Cairo's premier personal trainer. Transforming lives through dedicated coaching, personalized programs, and unwavering support.",
    'footer.quickLinks': 'Quick Links',
    'footer.services': 'Services',
    'footer.getInTouch': 'Get In Touch',
    'footer.rights': 'All rights reserved.',
    'footer.madeIn': 'Made with love in Cairo, Egypt',

    // Dashboard
    'dashboard.title': 'Admin Dashboard',
    'dashboard.overview': 'Overview',
    'dashboard.clients': 'Clients',
    'dashboard.sessions': 'Sessions',
    'dashboard.testimonials': 'Testimonials',
    'dashboard.messages': 'Messages',
    'dashboard.totalClients': 'Total Clients',
    'dashboard.activeClients': 'Active Clients',
    'dashboard.upcomingSessions': 'Upcoming Sessions',
    'dashboard.newMessages': 'New Messages',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.addClient': 'Add Client',
    'dashboard.editClient': 'Edit Client',
    'dashboard.deleteClient': 'Delete Client',
    'dashboard.addSession': 'Add Session',
    'dashboard.addTestimonial': 'Add Testimonial',
    'dashboard.approve': 'Approve',
    'dashboard.save': 'Save',
    'dashboard.cancel': 'Cancel',
    'dashboard.delete': 'Delete',
    'dashboard.actions': 'Actions',
    'dashboard.name': 'Name',
    'dashboard.email': 'Email',
    'dashboard.phone': 'Phone',
    'dashboard.age': 'Age',
    'dashboard.weight': 'Weight',
    'dashboard.height': 'Height',
    'dashboard.goal': 'Goal',
    'dashboard.plan': 'Plan',
    'dashboard.status': 'Status',
    'dashboard.notes': 'Notes',
    'dashboard.date': 'Date',
    'dashboard.type': 'Type',
    'dashboard.duration': 'Duration (min)',
    'dashboard.rating': 'Rating',
    'dashboard.comment': 'Comment',
    'dashboard.approved': 'Approved',
    'dashboard.pending': 'Pending',
    'dashboard.active': 'Active',
    'dashboard.inactive': 'Inactive',

    // Login
    'login.title': 'Admin Login',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.submit': 'Login',
    'login.error': 'Invalid email or password',
    'login.backToSite': 'Back to Site',

    // Pricing
    'pricing.title': 'Training Packages',
    'pricing.subtitle': 'Pricing',
    'pricing.desc': 'Choose the package that fits your goals and budget. All packages include personal attention and expert guidance.',
    'pricing.starter': 'Starter',
    'pricing.professional': 'Professional',
    'pricing.elite': 'Elite',
    'pricing.month': '/month',
    'pricing.mostPopular': 'MOST POPULAR',
    'pricing.starter.f1': '3 sessions/week',
    'pricing.starter.f2': 'Basic nutrition guide',
    'pricing.starter.f3': 'WhatsApp support',
    'pricing.starter.f4': 'Monthly assessment',
    'pricing.professional.f1': '5 sessions/week',
    'pricing.professional.f2': 'Custom nutrition plan',
    'pricing.professional.f3': 'Client portal access',
    'pricing.professional.f4': 'Weekly follow-up',
    'pricing.professional.f5': 'Supplement guidance',
    'pricing.professional.f6': 'Progress tracking',
    'pricing.professional.f7': 'Priority support',
    'pricing.elite.f1': 'Unlimited sessions',
    'pricing.elite.f2': 'Advanced nutrition plan',
    'pricing.elite.f3': '24/7 direct contact',
    'pricing.elite.f4': 'Daily follow-up',
    'pricing.elite.f5': 'Competition prep',
    'pricing.elite.f6': 'Supplement plan',
    'pricing.elite.f7': 'Video form review',
    'pricing.elite.f8': 'Guaranteed results',
    'pricing.cta': 'Get Started',
    'pricing.note': 'All packages include a free initial consultation. No long-term contracts.',

    // FAQ
    'faq.subtitle': 'FAQ',
    'faq.title': 'Frequently Asked Questions',
    'faq.desc': 'Got questions? We have answers. Learn everything you need about training with Coach Conan.',
    'faq.q1': 'How do I get started with Coach Conan?',
    'faq.a1': 'Getting started is easy! Simply reach out through our contact form or WhatsApp, and Coach Conan will schedule a free consultation to discuss your goals, current fitness level, and lifestyle. From there, he\'ll recommend the best program for you and create a fully personalized plan. No commitment required for the initial consultation — it\'s completely free.',
    'faq.q2': "What's included in the training packages?",
    'faq.a2': 'Each package is customized to your needs, but typically includes: a personalized workout program, nutrition guidance tailored to your goals, weekly check-ins to track progress, form correction via video reviews, and 24/7 WhatsApp support for questions and motivation. Premium packages also include weekly video calls and real-time workout sessions.',
    'faq.q3': 'Can I train online if I\'m outside Cairo?',
    'faq.a3': 'Absolutely! Coach Conan\'s online coaching program is designed for clients anywhere in the world. You\'ll receive the same quality of personalized training through video consultations, detailed workout plans, nutrition guidance, and constant WhatsApp support. Many of our most successful transformations come from clients in Dubai, Saudi Arabia, Europe, and even North America.',
    'faq.q4': 'How long before I see results?',
    'faq.a4': 'Results vary based on your starting point and dedication, but most clients notice significant changes within 4-6 weeks. Initial improvements include increased energy, better sleep, and improved mood. Visible body composition changes typically appear by week 6-8. For a complete transformation, our 12-week program delivers dramatic, lasting results. Remember — consistency is key, and Coach Conan will keep you accountable every step of the way.',
    'faq.q5': 'Do I need gym experience to start?',
    'faq.a5': 'Not at all! Coach Conan works with clients of all fitness levels, from complete beginners to advanced athletes. Every program is built from scratch based on your current abilities and goals. Coach Conan will teach you proper form, guide you through each exercise, and progressively increase intensity as you get stronger. Your journey starts exactly where you are — no experience necessary.',
    'faq.q6': 'What makes Coach Conan different from other trainers?',
    'faq.a6': 'Coach Conan stands out through his science-based approach, personalized programming, and genuine commitment to each client\'s success. Unlike generic trainers, he creates truly individualized plans based on your body type, lifestyle, and goals. With over a decade of experience, professional certifications, and a track record of hundreds of successful transformations, Coach Conan combines expertise with the motivational coaching style that keeps clients consistent and excited about their progress.',
    'faq.cta.title': 'Still have questions?',
    'faq.cta.button': 'Contact Coach Conan',

    // Client Portal
    'portal.title': 'Client Portal',
    'portal.welcome': 'Welcome',
    'portal.mySessions': 'My Sessions',
    'portal.myProgress': 'My Progress',
    'portal.myPlan': 'My Plan',
    'portal.loginTitle': 'Client Login',
    'portal.loginDesc': 'Enter your phone number to access your portal',
    'portal.phone': 'Phone Number',
    'portal.login': 'Access Portal',
    'portal.noSessions': 'No sessions scheduled',
    'portal.logout': 'Logout',
    'portal.register': 'Register',
    'portal.registerTitle': 'Client Registration',
    'portal.registerDesc': 'Create your account to access the client portal',
    'portal.registerName': 'Full Name',
    'portal.registerEmail': 'Email (optional)',
    'portal.registerPhone': 'Phone Number',
    'portal.registerGoal': 'Your Goal',
    'portal.registerPassword': 'Password',
    'portal.registerSubmit': 'Create Account',
    'portal.registerSuccess': 'Registration successful!',
    'portal.registerSuccessDesc': 'Your account is pending approval. Coach Conan will review it soon.',
    'portal.alreadyHaveAccount': 'Already have an account?',
    'portal.noAccount': "Don't have an account?",
    'portal.loginHere': 'Login here',
    'portal.selectGoal': 'Select your goal',

    // Results / Transformations
    'results.title': 'Proven Results',
    'results.subtitle': 'Transformations',
    'results.desc': 'Real numbers, real transformations. See what can be achieved with dedication and the right guidance.',
    'results.stat.transformations': 'Transformations',
    'results.stat.successRate': 'Success Rate',
    'results.stat.avgWeeks': '12-Week Average',
    'results.stat.yearsExp': 'Years Experience',
    'results.fatLoss': 'Fat Loss',
    'results.muscleGain': 'Muscle Gain',
    'results.athletic': 'Athletic Performance',
    'results.recomp': 'Body Recomposition',
    'results.before': 'Before',
    'results.after': 'After',
    'results.t1.result': 'Lost 15kg in 12 weeks',
    'results.t2.result': 'Gained 8kg pure muscle',
    'results.t3.result': '40% strength increase',
    'results.t4.result': 'Lost 12kg fat + gained 4kg muscle',
    'results.cta.sub': 'Ready to start your own transformation?',
    'results.cta.btn': 'Start Your Transformation',
  },
  ar: {
    // Navbar
    'nav.home': 'الرئيسية',
    'nav.about': 'عني',
    'nav.services': 'الخدمات',
    'nav.achievements': 'الإنجازات',
    'nav.testimonials': 'آراء العملاء',
    'nav.contact': 'تواصل',
    'nav.bookNow': 'احجز الآن',
    'nav.admin': 'لوحة المدرب',
    'nav.clientPortal': 'العملاء',
    'nav.clients': 'العملاء',
    'nav.logout': 'خروج',
    'nav.login': 'تسجيل دخول',

    // Hero
    'hero.badge': 'تدريب أونلاين',
    'hero.title1': 'حوّل',
    'hero.title2': 'جسمك وعقلك',
    'hero.desc': 'أقوى مدرب في القاهرة. 10+ سنين خبرة في تحويل الأجساد عبر التدريب الأونلاين والشخصي.',
    'hero.cta1': 'ابدأ رحلتك',
    'hero.cta2': 'شاهد البرامج',
    'hero.follow': 'تابع كوتش كونان',
    'hero.scroll': 'اسكرول',
    'hero.yearsExp': 'سنوات خبرة',
    'hero.followers': 'متابعين',
    'hero.results': 'نتائج',

    // About
    'about.subtitle': 'قصتي',
    'about.title': 'عن كوتش كونان',
    'about.badge': 'أفضل مدرب لياقة في القاهرة',
    'about.heading': 'بنحوّل حياتك من خلال اللياقة',
    'about.p1': 'مدرب شخصي معتمد في القاهرة بخبرة 10+ سنين. مدرب رئيسي في فِت هَب جيم — ساعدت مئات العملاء في تحقيق الجسم المثالي.',
    'about.p2': 'متخصص في تحويل الأجساد، التدريب بالأثقال والتغذية. فلسفتي بسيطة: كل جسم مختلف، وكل برنامج لازم يكون مختلف.',
    'about.scienceBased': 'تدريب علمي',
    'about.certifiedPro': 'محترف معتمد',
    'about.journey': 'رحلتي',
    'about.stat.years': 'سنوات الخبرة',
    'about.stat.clients': 'عملاء مدربين',
    'about.stat.success': 'نسبة النجاح',
    'about.stat.satisfaction': 'رضا العملاء',
    'about.m1.title': 'بداية رحلة اللياقة',
    'about.m1.desc': 'بدأ مسيرته كمدرب شخصي في القاهرة، وكرّس حياته لللياقة والصحة.',
    'about.m2.title': 'مدرب شخصي معتمد',
    'about.m2.desc': 'حصل على الشهادة المهنية، ورسّخ خبرته في القوة والتكييف.',
    'about.m3.title': 'انضم لجيم فِت هَب',
    'about.m3.desc': 'بقى مدرب رئيسي في فِت هَب، واحد من أرقى مراكز اللياقة في القاهرة.',
    'about.m4.title': 'إطلاق التدريب الأونلاين',
    'about.m4.desc': 'وسّع نطاقه عالميًا ببرامج التدريب الأونلاين، وساعد عملاء في كل مكان.',
    'about.m5.title': 'مجتمع 14K+ على إنستاجرام',
    'about.m5.desc': 'بنى مجتمع لياقة نابض بالحياة يشارك نصائح التمرين والتحولات والتحفيز.',
    'about.m6.title': 'مدرب تحولات متميز',
    'about.m6.desc': 'اتعرف كواحد من أفضل متخصصي التحولات في القاهرة بنتائج مثبتة.',

    // Services
    'services.subtitle': 'اللي بنقدمه',
    'services.title': 'برامج التدريب',
    'services.desc': 'كل برنامج مبني على أهدافك ومواعيدك واختياراتك. مفيش برامج جاهزة — نتائج حقيقية بس.',
    'services.popular': 'الأكثر شعبية',
    'services.s1.title': 'تدريب شخصي',
    'services.s1.desc': 'جلسات تدريب فردية في جيم فِت هَب مع برامج تمرين مخصصة مصممة خصيصًا لنوع جسمك وأهدافك.',
    'services.s1.f1': 'برامج تمرين مخصصة',
    'services.s1.f2': 'تصحيح الأداء والتوجيه',
    'services.s1.f3': 'تتبع التقدم',
    'services.s1.f4': 'مواعيد مرنة',
    'services.s2.title': 'تدريب أونلاين',
    'services.s2.desc': 'حوّل جسمك من أي مكان في العالم مع برنامج التدريب الأونلاين الشامل. نفس النتائج بتوجيه افتراضي.',
    'services.s2.f1': 'استشارات فيديو أسبوعية',
    'services.s2.f2': 'خطط تدريب مخصصة',
    'services.s2.f3': 'إرشاد تغذوي',
    'services.s2.f4': 'دعم واتساب 24/7',
    'services.s3.title': 'تخطيط التغذية',
    'services.s3.desc': 'خطط تغذية علمية مصممة حسب أسلوب حياتك واختياراتك وأهدافك. مفيش دايتات عامة — بس اللي بيشتغل معاك.',
    'services.s3.f1': 'خطط وجبات مخصصة',
    'services.s3.f2': 'توجيه تتبع الماكرو',
    'services.s3.f3': 'نصائح المكملات',
    'services.s3.f4': 'اقتراحات وصفات',
    'services.s4.title': 'تحويل الجسم',
    'services.s4.desc': 'برنامج التحول لمدة 12 أسبوع المصمم يعيد تشكيل جسمك بالكامل بمنهج شامل للتدريب والتغذية.',
    'services.s4.f1': 'برنامج 12 أسبوع منظم',
    'services.s4.f2': 'تتبع قبل وبعد',
    'services.s4.f3': 'متابعة أسبوعية',
    'services.s4.f4': 'تغيير شامل لأسلوب الحياة',
    'services.getStarted': 'ابدأ الآن',
    'services.process.subtitle': 'الخطوات',
    'services.process.title': 'إزاي بنشتغل',
    'services.step1.title': 'استشارة',
    'services.step1.desc': 'استشارة مجالية لفهم أهدافك ومستوى لياقتك الحالي وأسلوب حياتك.',
    'services.step2.title': 'خطة مخصصة',
    'services.step2.desc': 'خطة تدريب وتغذية مخصصة مصممة خصيصًا ليك.',
    'services.step3.title': 'تنفيذ',
    'services.step3.desc': 'نفّذ الخطة مع كوتش كونان بيوجّهك في كل خطوة.',
    'services.step4.title': 'تحول',
    'services.step4.desc': 'شوف نتائج حقيقية مع تعديلات مستمرة ودعم لضمان النجاح.',

    // Certificates
    'certs.subtitle': 'المؤهلات',
    'certs.title': 'الشهادات والإنجازات',
    'certs.desc': 'بنتعلم ونطور باستمرار عشان نقدم أفضل تجربة تدريب مدعومة بالعلم والخبرة المعتمدة.',
    'certs.certified': 'معتمد منذ',
    'certs.banner.title': 'ملتزم بالتميز',
    'certs.banner.desc': 'كل شهادة بتمثل التزام بتقديك أنسب وأحدث طرق التدريب العلمية المتاحة.',
    'certs.a1': 'شهادات مهنية',
    'certs.a2': 'سنوات في مجال اللياقة',
    'certs.a3': 'متابعين على السوشيال',
    'certs.a4': 'تحولات ناجحة',
    'certs.a5': 'أفضل مدرب في فِت هَب',
    'certs.a6': 'تقييمات 5 نجوم',

    // Testimonials
    'testimonials.subtitle': 'آراء العملاء',
    'testimonials.title': 'قصص نجاح العملاء',
    'testimonials.desc': 'ناس حقيقيين. نتائج حقيقية. اسمع من العملاء اللي غيّروا حياتهم مع كوتش كونان.',

    // Feedback
    'feedback.title': 'شارك تجربتك',
    'feedback.subtitle': 'رأيك يهمنا',
    'feedback.name': 'اسمك',
    'feedback.comment': 'تعليقك',
    'feedback.rating': 'التقييم',
    'feedback.submit': 'أرسل التقييم',
    'feedback.success': 'شكراً! تقييمك سيظهر بعد الموافقة.',
    'feedback.recentFeedback': 'أحدث التقييمات',
    'feedback.noFeedback': 'لا يوجد تقييمات بعد. كن أول واحد!',
    'feedback.submitting': 'جاري الإرسال...',

    // Contact
    'contact.subtitle': 'تواصل معايا',
    'contact.title': 'تواصل',
    'contact.desc': 'مستعد تبدأ تحولك؟ تواصل وبنبني أحسن نسخة منك مع بعض.',
    'contact.location': 'الموقع',
    'contact.phone': 'التليفون',
    'contact.email': 'الإيميل',
    'contact.hours': 'ساعات العمل',
    'contact.connect': 'تواصل معايا',
    'contact.form.title': 'ابعت رسالة',
    'contact.form.desc': 'املا الفورم وكوتش كونان هيرد عليك خلال 24 ساعة.',
    'contact.form.name': 'الاسم الكامل',
    'contact.form.emailLabel': 'الإيميل',
    'contact.form.phoneLabel': 'رقم التليفون',
    'contact.form.interested': 'مهتم بـ',
    'contact.form.selectService': 'اختار خدمة',
    'contact.form.messageLabel': 'الرسالة',
    'contact.form.send': 'ابعت الرسالة',
    'contact.form.sending': 'بتبعت...',
    'contact.form.success': 'تم إرسال الرسالة!',
    'contact.form.successDesc': 'كوتش كونان هيرد عليك قريب.',
    'contact.chatWhatsApp': 'كلم على واتساب',

    // Footer
    'footer.desc': 'أفضل مدرب شخصي في القاهرة. بنحوّل حياة الناس من خلال التدريب المخصص والبرامج الشخصية والدعم المستمر.',
    'footer.quickLinks': 'روابط سريعة',
    'footer.services': 'الخدمات',
    'footer.getInTouch': 'تواصل معايا',
    'footer.rights': 'جميع الحقوق محفوظة.',
    'footer.madeIn': 'اتعمل بحب في القاهرة، مصر',

    // Dashboard
    'dashboard.title': 'لوحة التحكم',
    'dashboard.overview': 'نظرة عامة',
    'dashboard.clients': 'العملاء',
    'dashboard.sessions': 'الجلسات',
    'dashboard.testimonials': 'آراء العملاء',
    'dashboard.messages': 'الرسائل',
    'dashboard.totalClients': 'إجمالي العملاء',
    'dashboard.activeClients': 'العملاء النشطين',
    'dashboard.upcomingSessions': 'الجلسات القادمة',
    'dashboard.newMessages': 'رسائل جديدة',
    'dashboard.recentActivity': 'النشاط الأخير',
    'dashboard.addClient': 'إضافة عميل',
    'dashboard.editClient': 'تعديل عميل',
    'dashboard.deleteClient': 'حذف عميل',
    'dashboard.addSession': 'إضافة جلسة',
    'dashboard.addTestimonial': 'إضافة رأي',
    'dashboard.approve': 'اعتمد',
    'dashboard.save': 'حفظ',
    'dashboard.cancel': 'إلغاء',
    'dashboard.delete': 'حذف',
    'dashboard.actions': 'إجراءات',
    'dashboard.name': 'الاسم',
    'dashboard.email': 'الإيميل',
    'dashboard.phone': 'التليفون',
    'dashboard.age': 'العمر',
    'dashboard.weight': 'الوزن',
    'dashboard.height': 'الطول',
    'dashboard.goal': 'الهدف',
    'dashboard.plan': 'الخطة',
    'dashboard.status': 'الحالة',
    'dashboard.notes': 'ملاحظات',
    'dashboard.date': 'التاريخ',
    'dashboard.type': 'النوع',
    'dashboard.duration': 'المدة (دقيقة)',
    'dashboard.rating': 'التقييم',
    'dashboard.comment': 'تعليق',
    'dashboard.approved': 'معتمد',
    'dashboard.pending': 'قيد الانتظار',
    'dashboard.active': 'نشط',
    'dashboard.inactive': 'غير نشط',

    // Login
    'login.title': 'تسجيل دخول الأدمن',
    'login.email': 'الإيميل',
    'login.password': 'كلمة المرور',
    'login.submit': 'دخول',
    'login.error': 'إيميل أو كلمة مرور غلط',
    'login.backToSite': 'الرجوع للموقع',

    // Pricing
    'pricing.title': 'باقات التدريب',
    'pricing.subtitle': 'الأسعار',
    'pricing.desc': 'اختر الباقة التي تناسب أهدافك وميزانيتك. جميع الباقات تشمل اهتمام شخصي وتوجيه خبير.',
    'pricing.starter': 'المبتدئ',
    'pricing.professional': 'المحترف',
    'pricing.elite': 'النخبة',
    'pricing.month': '/شهر',
    'pricing.mostPopular': 'الأكثر شعبية',
    'pricing.starter.f1': '3 جلسات/أسبوع',
    'pricing.starter.f2': 'دليل تغذية أساسي',
    'pricing.starter.f3': 'دعم واتساب',
    'pricing.starter.f4': 'تقييم شهري',
    'pricing.professional.f1': '5 جلسات/أسبوع',
    'pricing.professional.f2': 'خطة تغذية مخصصة',
    'pricing.professional.f3': 'دخول بوابة العميل',
    'pricing.professional.f4': 'متابعة أسبوعية',
    'pricing.professional.f5': 'إرشاد المكملات',
    'pricing.professional.f6': 'تتبع التقدم',
    'pricing.professional.f7': 'دعم ذو أولوية',
    'pricing.elite.f1': 'جلسات غير محدودة',
    'pricing.elite.f2': 'خطة تغذية متقدمة',
    'pricing.elite.f3': 'تواصل مباشر 24/7',
    'pricing.elite.f4': 'متابعة يومية',
    'pricing.elite.f5': 'تحضير للمسابقات',
    'pricing.elite.f6': 'خطة مكملات',
    'pricing.elite.f7': 'مراجعة أداء بالفيديو',
    'pricing.elite.f8': 'نتائج مضمونة',
    'pricing.cta': 'ابدأ الآن',
    'pricing.note': 'جميع الباقات تشمل استشارة أولية مجانية. لا توجد عقود طويلة الأجل.',

    // FAQ
    'faq.subtitle': 'الأسئلة المتكررة',
    'faq.title': 'أسئلة شائعة',
    'faq.desc': 'لديك أسئلة؟ لدينا إجابات. اعرف كل ما تحتاج عن التدريب مع كوتش كونان.',
    'faq.q1': 'كيف أبدأ مع كوتش كونان؟',
    'faq.a1': 'البدء سهل! تواصل معانا من خلال فورم التواصل أو الواتساب، وكوتش كونان هيحجزلك استشارة مجانية لمناقشة أهدافك ومستوى لياقتك وأسلوب حياتك. من هناك، هيوصيلك بأفضل برنامج ويعملك خطة مخصصة بالكامل. مفيش التزام للاستشارة الأولى — مجانية تمامًا.',
    'faq.q2': 'ماذا تتضمن باقات التدريب؟',
    'faq.a2': 'كل باقة مخصصة حسب احتياجاتك، بس بتشمل عادةً: برنامج تمرين مخصص، توجيه تغذوي حسب أهدافك، متابعة أسبوعية لتتبع التقدم، تصحيح الأداء عن طريق مراجعة الفيديو، ودعم واتساب 24/7 للأسئلة والتحفيز. الباقات المميزة بتشمل كمان مكالمات فيديو أسبوعية وجلسات تمرين مباشرة.',
    'faq.q3': 'هل يمكنني التدريب أونلاين إذا كنت خارج القاهرة؟',
    'faq.a3': 'أكيد! برنامج التدريب الأونلاين لكوتش كونان مصمم للعملاء في أي مكان في العالم. هتستقبل نفس جودة التدريب المخصص من خلال استشارات فيديو، خطط تمرين مفصلة، توجيه تغذوي، ودعم واتساب مستمر. كتير من أنجح التحولات بتاعتنا جاية من عملاء في دبي، السعودية، أوروبا، وحتى أمريكا الشمالية.',
    'faq.q4': 'كم الوقت قبل أن أرى نتائج؟',
    'faq.a4': 'النتائج بتختلف حسب نقطة البداية والالتزام بتاعك، بس أغلب العملاء بيلاحظوا تغييرات كبيرة خلال 4-6 أسابيع. التحسينات الأولية بتشمل زيادة الطاقة، نوم أحسن، ومزاج أفضل. التغيرات المرئية في تكوين الجسم بتظهر عادةً في الأسبوع 6-8. للتحول الكامل، برنامج الـ 12 أسبوع بيقدم نتائج دراماتيكية ومستدامة. افتكر — الاستمرارية هي المفتاح، وكوتش كونان هيبقى معاك في كل خطوة.',
    'faq.q5': 'هل أحتاج خبرة في الجيم للبدء؟',
    'faq.a5': 'مش لازم خالص! كوتش كونان بيشتغل مع عملاء من كل مستويات اللياقة، من مبتدئين كاملين لرياضيين متقدمين. كل برنامج بيتعمل من الصفر حسب قدراتك وأهدافك الحالية. كوتش كونان هيعلمك الأداء الصحيح، يوجّهك في كل تمرين، ويزود الشدة تدريجيًا لما تقوى. رحلتك بتبدأ من بالظبط المكان اللي إنت فيه — مش محتاج أي خبرة.',
    'faq.q6': 'ما الذي يميز كوتش كونان عن المدربين الآخرين؟',
    'faq.a6': 'كوتش كونان بيتميز بأسلوبه العلمي، البرمجة المخصصة، والتزامه الحقيقي بنجاح كل عميل. على عكس المدربين العاديين، بيعمل خطط مخصصة بالفعل حسب نوع جسمك وأسلوب حياتك وأهدافك. مع أكثر من عشر سنين خبرة، شهادات مهنية، وسجل حافل بمئات التحولات الناجحة، كوتش كونان بيجمع بين الخبرة وأسلوب التدريب التحفيزي اللي بيخلّي العملاء مستمرين ومتحمسين عن تقدمهم.',
    'faq.cta.title': 'لا تزال لديك أسئلة؟',
    'faq.cta.button': 'تواصل مع كوتش كونان',

    // Client Portal
    'portal.title': 'بوابة العميل',
    'portal.welcome': 'أهلاً',
    'portal.mySessions': 'جلساتي',
    'portal.myProgress': 'تقدمي',
    'portal.myPlan': 'خطتي',
    'portal.loginTitle': 'تسجيل دخول العميل',
    'portal.loginDesc': 'ادخل رقم تليفونك عشان تدخل البوابة',
    'portal.phone': 'رقم التليفون',
    'portal.login': 'دخول',
    'portal.noSessions': 'مفيش جلسات مجدولة',
    'portal.logout': 'خروج',
    'portal.register': 'سجل',
    'portal.registerTitle': 'تسجيل عميل جديد',
    'portal.registerDesc': 'اعمل حسابك عشان تدخل بوابة العميل',
    'portal.registerName': 'الاسم الكامل',
    'portal.registerEmail': 'الإيميل (اختياري)',
    'portal.registerPhone': 'رقم التليفون',
    'portal.registerGoal': 'هدفك',
    'portal.registerPassword': 'كلمة المرور',
    'portal.registerSubmit': 'اعمل حساب',
    'portal.registerSuccess': 'تم التسجيل بنجاح!',
    'portal.registerSuccessDesc': 'حسابك في انتظار الموافقة. كوتش كونان هيراجعه قريب.',
    'portal.alreadyHaveAccount': 'عندك حساب؟',
    'portal.noAccount': 'ممعكش حساب؟',
    'portal.loginHere': 'سجل دخول من هنا',
    'portal.selectGoal': 'اختار هدفك',

    // Results / Transformations
    'results.title': 'نتائج مثبتة',
    'results.subtitle': 'التحولات',
    'results.desc': 'أرقام حقيقية، تحولات حقيقية. شاهد ما يمكن تحقيقه بالتفاني والتوجيه الصحيح.',
    'results.stat.transformations': 'تحولات',
    'results.stat.successRate': 'نسبة النجاح',
    'results.stat.avgWeeks': 'متوسط 12 أسبوع',
    'results.stat.yearsExp': 'سنوات خبرة',
    'results.fatLoss': 'خسارة دهون',
    'results.muscleGain': 'زيادة عضلات',
    'results.athletic': 'الأداء الرياضي',
    'results.recomp': 'إعادة تشكيل الجسم',
    'results.before': 'قبل',
    'results.after': 'بعد',
    'results.t1.result': 'خسّر 15 كجم في 12 أسبوع',
    'results.t2.result': 'اكتسب 8 كجم عضلات صافية',
    'results.t3.result': 'زيادة 40% في القوة',
    'results.t4.result': 'خسّر 12 كجم دهون + اكتسب 4 كجم عضلات',
    'results.cta.sub': 'مستعد تبدأ تحولك الشخصي؟',
    'results.cta.btn': 'ابدأ تحولك الآن',
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Same key as I18nProvider in @/lib/i18n so both systems stay in sync
const LANG_KEY = 'coach_conan_lang'

function getInitialLang(): Language {
  if (typeof window === 'undefined') return 'ar'
  const saved = localStorage.getItem(LANG_KEY) as Language | null
  if (saved && (saved === 'en' || saved === 'ar')) return saved
  return 'ar'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(getInitialLang)

  // Listen for changes from the other i18n system (I18nProvider in @/lib/i18n)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === LANG_KEY && (e.newValue === 'en' || e.newValue === 'ar')) {
        setLangState(e.newValue)
      }
    }
    // Also poll for same-tab changes since StorageEvent only fires cross-tab
    const interval = setInterval(() => {
      try {
        const saved = localStorage.getItem(LANG_KEY) as Language | null
        if (saved && (saved === 'en' || saved === 'ar') && saved !== lang) {
          setLangState(saved)
        }
      } catch { /* ignore */ }
    }, 500)
    window.addEventListener('storage', onStorage)
    return () => { window.removeEventListener('storage', onStorage); clearInterval(interval) }
  }, [lang])

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang)
    localStorage.setItem(LANG_KEY, newLang)
    document.documentElement.lang = newLang
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr'
  }, [])

  const t = (key: string): string => {
    return translations[lang][key] || key
  }

  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const currency = lang === 'ar' ? 'ج.م' : 'EGP'
  const formatPrice = (price: number) => {
    return lang === 'ar' ? `${price} ج.م` : `${price} EGP`
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir, currency, formatPrice }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
