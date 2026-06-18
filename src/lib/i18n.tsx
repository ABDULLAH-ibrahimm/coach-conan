'use client'

import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from 'react'

export type Language = 'en' | 'ar'

export interface Translations {
  // Navbar
  nav: {
    home: string
    about: string
    services: string
    achievements: string
    testimonials: string
    contact: string
    bookNow: string
    myPortal: string
    coachDashboard: string
    langToggle: string
  }
  // Hero
  hero: {
    badge: string
    heading1: string
    heading2: string
    description: string
    startJourney: string
    viewPrograms: string
    followCoach: string
    yearsExp: string
    followers: string
    results: string
    scroll: string
    imageAlt: string
  }
  // About
  about: {
    sectionTitle: string
    sectionSubtitle: string
    yearsExp: string
    clientsTrained: string
    successRate: string
    satisfaction: string
    badge: string
    heading: string
    p1: string
    p2: string
    p3: string
    scienceBased: string
    certified: string
    journey: string
    milestones: { year: string; title: string; desc: string }[]
  }
  // Services
  services: {
    sectionTitle: string
    sectionSubtitle: string
    description: string
    personalTraining: string
    personalTrainingDesc: string
    onlineCoaching: string
    onlineCoachingDesc: string
    nutritionPlanning: string
    nutritionPlanningDesc: string
    bodyTransformation: string
    bodyTransformationDesc: string
    mostPopular: string
    getStarted: string
    howItWorks: string
    theProcess: string
    steps: { title: string; desc: string }[]
    personalFeatures: string[]
    onlineFeatures: string[]
    nutritionFeatures: string[]
    bodyFeatures: string[]
  }
  // Pricing
  pricing: {
    sectionTitle: string
    sectionSubtitle: string
    description: string
    starter: string
    starterDesc: string
    pro: string
    proDesc: string
    elite: string
    eliteDesc: string
    mostPopular: string
    perMonth: string
    currencySymbol: string
    getStarted: string
    starterFeatures: string[]
    proFeatures: string[]
    eliteFeatures: string[]
    footerNote: string
  }
  // Results
  results: {
    sectionTitle: string
    sectionSubtitle: string
    description: string
    transformations: string
    successRate: string
    averageResults: string
    yearsExperience: string
    weeks: string
    cards: { goal: string; result: string; testimonial: string }[]
  }
  // Certificates
  certificates: {
    sectionTitle: string
    sectionSubtitle: string
    description: string
    items: { title: string; issuer: string; description: string }[]
    achievements: { label: string; value: string }[]
    bannerHeading: string
    bannerText: string
    certifiedSince: string
  }
  // Testimonials
  testimonials: {
    sectionTitle: string
    sectionSubtitle: string
    description: string
    items: { name: string; role: string; text: string }[]
    leaveComment: string
    commentPlaceholder: string
    yourName: string
    submitComment: string
    submitting: string
    commentSuccess: string
    commentsSection: string
    cancel: string
    rating: string
    yourComment: string
    beFirstComment: string
  }
  // FAQ
  faq: {
    sectionTitle: string
    sectionSubtitle: string
    description: string
    items: { question: string; answer: string }[]
    stillQuestions: string
    contactCoach: string
  }
  // Client Portal CTA
  portalCta: {
    sectionTitle: string
    sectionSubtitle: string
    description: string
    features: { label: string; desc: string }[]
    loginButton: string
    portalHeader: string
    todayWorkout: string
    active: string
    nutritionPlan: string
    progress: string
    nextSession: string
    portalName: string
    mockWorkoutDesc: string
    mockCalories: string
    mockProtein: string
    mockCarbs: string
    mockFats: string
    mockWeightLoss: string
    mockTomorrow: string
  }
  // Dashboard
  dashboard: {
    // Sidebar labels
    dashboard: string
    clients: string
    clientData: string
    workouts: string
    nutrition: string
    progress: string
    sessions: string
    payments: string
    settings: string
    signOut: string
    backToWebsite: string
    // Dashboard Home
    totalClients: string
    activeClients: string
    sessionsThisWeek: string
    revenueThisMonth: string
    revenueOverview: string
    totalRevenue: string
    pendingPayments: string
    overdue: string
    vsLastMonth: string
    quickActions: string
    addClient: string
    registerNewClient: string
    createWorkout: string
    designWorkoutPlan: string
    scheduleSession: string
    bookTrainingSession: string
    upcomingSessions: string
    noUpcomingSessions: string
    scheduledSessionsWillAppear: string
    viewAll: string
    recentActivity: string
    noRecentActivity: string
    activityLogsWillAppear: string
    // Client Portal labels
    clientPortal: string
    website: string
    // Chart & relative time labels
    thisMonth: string
    lastMonth: string
    justNow: string
    minutesAgo: string
    hoursAgo: string
    daysAgo: string
    clientFallback: string
    trainingFallback: string
    // Common shared strings
    save: string
    cancel: string
    delete: string
    edit: string
    close: string
    done: string
    update: string
    saving: string
    create: string
    allClients: string
    selectClient: string
    filterByClient: string
    male: string
    female: string
    active: string
    inactive: string
    approved: string
    rejected: string
    completed: string
    cancelled: string
    scheduled: string
    paid: string
    draft: string
    tryAgain: string
    unknown: string
    revenue: string
    // ClientManager
    manageClients: string
    allClientsTab: string
    pendingApprovalTab: string
    noClientsFound: string
    addFirstClient: string
    noPendingApprovals: string
    allRegistrationsReviewed: string
    searchClients: string
    clientApproved: string
    clientRejected: string
    approveFailed: string
    rejectFailed: string
    clientUpdated: string
    clientCreated: string
    clientDeactivated: string
    deactivateFailed: string
    saveClientFailed: string
    nameEmailRequired: string
    editClientTitle: string
    addNewClientTitle: string
    updateClientInfo: string
    registerNewClientDesc: string
    fullNamePlaceholder: string
    emailPlaceholderDash: string
    phonePlaceholderDash: string
    agePlaceholderDash: string
    selectOption: string
    goalPlaceholderDash: string
    createWithPortalAccess: string
    autoGenCredentials: string
    securePasswordNote: string
    createGenerateCreds: string
    clientPortalCredentials: string
    shareCredentials: string
    emailUpper: string
    passwordUpper: string
    shareSecurely: string
    passwordNotShownAgain: string
    copyCredentials: string
    copiedToClipboard: string
    copyFailed: string
    deleteClientTitle: string
    deactivateClientConfirm: string
    clientSince: string
    ageYears: string
    weightKg: string
    heightCm: string
    statusLabel: string
    approvalLabel: string
    noWorkoutPlansYet: string
    noNutritionPlansYet: string
    noProgressEntriesYet: string
    noSessionsFoundDetail: string
    noFrequencySet: string
    noCaloriesSet: string
    pendingApprovalLabel: string
    rejectedLabel: string
    approvedLabel: string
    approveBtn: string
    rejectBtn: string
    profileImage: string
    uploadImage: string
    uploading: string
    maxSize2MB: string
    remove: string
    notesLabel: string
    phoneOrEmailRequired: string
    forPortalAccess: string
    // WorkoutManager
    workoutPrograms: string
    manageWorkouts: string
    createProgram: string
    searchWorkouts: string
    noWorkoutPrograms: string
    createFirstProgram: string
    editWorkoutTitle: string
    createWorkoutTitle: string
    updateWorkoutDesc: string
    designWorkoutDesc: string
    basicInfo: string
    planNameLabel: string
    clientRequired: string
    frequencyLabel: string
    durationWeeks: string
    descriptionLabel: string
    programBuilder: string
    addWeek: string
    noWeeksAdded: string
    addFirstWeek: string
    weekNameOptional: string
    restLabel: string
    exerciseName: string
    muscleGroup: string
    sets: string
    reps: string
    weightKgField: string
    restSeconds: string
    tempo: string
    addExercise: string
    addDay: string
    duplicateBtn: string
    deleteWorkoutTitle: string
    deleteWorkoutConfirm: string
    nameClientRequired: string
    saveWorkoutFailed: string
    weekLabel: string
    restAndRecovery: string
    noExercisesDefined: string
    noDaysDefined: string
    noWeeksDefined: string
    dayLabel: string
    weekSingular: string
    weekPlural: string
    daySingular: string
    dayPlural: string
    planNamePlaceholder: string
    frequencyPlaceholder: string
    descriptionPlaceholder: string
    // NutritionManager
    nutritionPlans: string
    manageNutrition: string
    createPlan: string
    searchPlans: string
    noNutritionPlans: string
    createFirstNutritionPlan: string
    editNutritionTitle: string
    createNutritionTitle: string
    updateNutritionDesc: string
    designNutritionDesc: string
    planNameLabel: string
    descriptionOptional: string
    dailyMacros: string
    caloriesKcal: string
    proteinG: string
    carbsG: string
    fatsG: string
    fiberG: string
    fiberOptional: string
    waterMl: string
    autoCalculated: string
    autoCalcFromFood: string
    foodNameLabel: string
    dateRangeOptional: string
    startDate: string
    endDate: string
    mealsBuilder: string
    addMeal: string
    mealType: string
    mealName: string
    timeLabel: string
    foodItems: string
    addFoodItem: string
    quantityLabel: string
    unitLabel: string
    caloriesLabel: string
    untitledMeal: string
    itemLabel: string
    itemsLabel: string
    macroSummary: string
    dailyWaterTarget: string
    planDuration: string
    mealsLabel: string
    noMealsDefined: string
    noFoodItemsAdded: string
    deleteNutritionTitle: string
    deleteNutritionConfirm: string
    nameClientRequiredNutrition: string
    saveNutritionFailed: string
    breakfast: string
    snack: string
    lunch: string
    dinner: string
    preWorkout: string
    postWorkout: string
    custom: string
    // ProgressTracker
    progressTracker: string
    trackProgress: string
    addEntry: string
    selectClientLabel: string
    chooseClient: string
    selectClientTitle: string
    chooseClientProgress: string
    weightProgress: string
    weightKgChart: string
    progressHistory: string
    noProgressEntries: string
    addFirstEntry: string
    weightLabel: string
    bodyFatLabel: string
    muscleLabel: string
    waistLabel: string
    chestLabel: string
    armsLabel: string
    thighsLabel: string
    addProgressTitle: string
    recordMeasurementsFor: string
    weightKgField: string
    bodyFatPercent: string
    muscleMassKg: string
    waistCm: string
    chestCm: string
    armsCm: string
    thighsCm: string
    additionalNotes: string
    deleteEntryTitle: string
    deleteEntryConfirm: string
    selectClientFirst: string
    saveProgressFailed: string
    // SessionScheduler
    sessionsTitle: string
    manageSessions: string
    scheduleSessionBtn: string
    searchSessions: string
    upcomingSessionsTitle: string
    noSessionsTitle: string
    scheduleFirstSession: string
    editSessionTitle: string
    scheduleSessionTitle: string
    updateSessionDesc: string
    bookSessionDesc: string
    clientRequiredSession: string
    dateTimeRequired: string
    durationMin: string
    typeLabel: string
    selectType: string
    sessionNotes: string
    scheduleBtn: string
    deleteSessionTitle: string
    deleteSessionConfirm: string
    clientDateRequired: string
    saveSessionFailed: string
    personalTrainingSession: string
    onlineCoachingSession: string
    groupTraining: string
    assessment: string
    consultation: string
    followUp: string
    scheduledLabel: string
    completedLabel: string
    cancelledLabel: string
    allStatus: string
    // PaymentManager
    paymentsTitle: string
    trackPayments: string
    recordPaymentBtn: string
    totalRevenueLabel: string
    thisMonthLabel: string
    pendingLabel: string
    overdueLabel: string
    searchPayments: string
    paidLabel: string
    noPayments: string
    recordFirstPayment: string
    markPaid: string
    dueLabel: string
    paidLabelDate: string
    editPaymentTitle: string
    recordPaymentTitle: string
    updatePaymentDesc: string
    recordNewPayment: string
    clientRequiredPayment: string
    amountRequired: string
    amountLabel: string
    currencyLabel: string
    dueDateLabel: string
    paymentMethodLabel: string
    selectMethod: string
    deletePaymentTitle: string
    deletePaymentConfirm: string
    clientAmountRequired: string
    validAmountRequired: string
    savePaymentFailed: string
    cash: string
    bankTransfer: string
    creditCard: string
    debitCard: string
    mobilePayment: string
    onlineTransfer: string
    checkPayment: string
    otherPayment: string
    // CoachSettings
    settingsTitle: string
    manageProfileSecurity: string
    profileTab: string
    securityTab: string
    editProfile: string
    fullName: string
    profileImageUrl: string
    enterFullName: string
    profileImagePlaceholder: string
    pasteUrlNote: string
    imagePreview: string
    saveChanges: string
    savingChanges: string
    changePassword: string
    currentPassword: string
    newPasswordLabel: string
    confirmNewPassword: string
    enterCurrentPassword: string
    enterNewPassword: string
    confirmNewPasswordPlaceholder: string
    hidePassword: string
    showPassword: string
    passwordsDoNotMatch: string
    passwordsMatchLabel: string
    passwordRequirementsLabel: string
    allRequirementsMet: string
    accountLockoutPolicy: string
    lockoutPolicyDesc: string
    dangerZone: string
    irreversibleActions: string
    signOutAllDevices: string
    nameRequired: string
    nameMinLength: string
    invalidUrl: string
    profileUpdated: string
    profileUpdateFailed: string
    currentPasswordRequired: string
    passwordNotMeetReqs: string
    newPasswordsNoMatch: string
    passwordChanged: string
    passwordChangeFailed: string
    signedOutAllDevices: string
    atLeast8Chars: string
    oneUppercase: string
    oneLowercase: string
    oneNumber: string
    oneSpecialChar: string
    emailInfoLabel: string
    memberSince: string
    lastLogin: string
    notAvailable: string
    // ClientSpreadsheet
    clientSpreadsheet: string
    fullClientDetails: string
    exportCSVLabel: string
    totalClientsLabel: string
    activeClientsLabel: string
    pendingApprovalLabel: string
    avgWeightKg: string
    searchByNameEmailPhone: string
    statusFilter: string
    approvalFilter: string
    allApproval: string
    showingOfClients: string
    numberHeader: string
    fullNameHeader: string
    emailHeader: string
    phoneHeader: string
    ageHeader: string
    genderHeader: string
    weightKgHeader: string
    heightCmHeader: string
    goalHeader: string
    statusHeader: string
    approvalHeader: string
    startDateHeader: string
    registeredHeader: string
    noClientsFoundTable: string
    adjustSearchFilter: string
    failedToLoadClients: string
    tryAgainBtn: string
    csvExported: string
    failedToLoadClientsError: string
  }
  // Contact
  contact: {
    sectionTitle: string
    sectionSubtitle: string
    description: string
    location: string
    locationDetail: string
    phone: string
    phoneDetail: string
    email: string
    emailDetail: string
    workingHours: string
    workingHoursDetail: string
    connectWithMe: string
    instagram: string
    whatsapp: string
    facebook: string
    direct: string
    follow: string
    formHeading: string
    formDescription: string
    successHeading: string
    successText: string
    fullName: string
    fullNamePlaceholder: string
    emailLabel: string
    emailPlaceholder: string
    phoneLabel: string
    phonePlaceholder: string
    interestedIn: string
    selectService: string
    personalTraining: string
    onlineCoaching: string
    nutritionPlanning: string
    bodyTransformation: string
    message: string
    messagePlaceholder: string
    sending: string
    sendMessage: string
    somethingWentWrong: string
    failedToSend: string
  }
  // Footer
  footer: {
    brandDescription: string
    quickLinks: string
    services: string
    getInTouch: string
    chatWhatsApp: string
    copyright: string
    madeWith: string
    home: string
    about: string
    servicesNav: string
    achievements: string
    testimonials: string
    contact: string
  }
  // Coach Login
  coachLogin: {
    title: string
    subtitle: string
    email: string
    emailPlaceholder: string
    password: string
    passwordPlaceholder: string
    signIn: string
    backToWebsite: string
    loginFailed: string
  }
  // Client Login & Registration
  clientLogin: {
    signIn: string
    register: string
    email: string
    emailPlaceholder: string
    password: string
    passwordPlaceholder: string
    fullName: string
    fullNamePlaceholder: string
    confirmPassword: string
    confirmPlaceholder: string
    phone: string
    phonePlaceholder: string
    age: string
    agePlaceholder: string
    gender: string
    genderPlaceholder: string
    weight: string
    weightPlaceholder: string
    height: string
    heightPlaceholder: string
    goal: string
    goalPlaceholder: string
    createAccount: string
    fixErrors: string
    passwordMatch: string
    passwordNoMatch: string
    // Password requirements
    passwordRequirements: string
    minChars: string
    uppercase: string
    lowercase: string
    number: string
    specialChar: string
    // Status messages
    pendingApproval: string
    accountRejected: string
    registrationSuccess: string
    loginFailed: string
    // Validation
    nameRequired: string
    nameMinLength: string
    emailRequired: string
    emailInvalid: string
    passwordRequired: string
    passwordMinLength: string
    passwordUppercase: string
    passwordLowercase: string
    passwordNumber: string
    passwordSpecial: string
    confirmRequired: string
    confirmNoMatch: string
    ageInvalid: string
    weightInvalid: string
    heightInvalid: string
    // Gender options
    male: string
    female: string
    other: string
    // Goal options
    weightLoss: string
    muscleGain: string
    bodyRecomposition: string
    strength: string
    endurance: string
    flexibility: string
    generalFitness: string
    sportsPerformance: string
  }
  // Client Dashboard
  clientDash: {
    welcomeBack: string
    trainingOverview: string
    weight: string
    goalLabel: string
    activeProgram: string
    nextSession: string
    none: string
    latestMeasurements: string
    recordedOn: string
    bodyFat: string
    muscleMass: string
    waist: string
    // Tab names
    overview: string
    workouts: string
    nutrition: string
    progress: string
    sessions: string
    payments: string
    // Workouts
    workoutPrograms: string
    assignedPrograms: string
    noWorkouts: string
    noWorkoutsDesc: string
    week: string
    day: string
    days: string
    restDay: string
    restRecovery: string
    noExercises: string
    noProgramDetails: string
    // Nutrition
    nutritionPlans: string
    assignedPlans: string
    noNutrition: string
    noNutritionDesc: string
    dailyMacros: string
    calories: string
    protein: string
    carbs: string
    fats: string
    meals: string
    meal: string
    dailyWater: string
    planDuration: string
    noMeals: string
    noFoodItems: string
    // Progress
    progressTracking: string
    trackMeasurements: string
    addProgress: string
    weightProgress: string
    progressHistory: string
    noProgress: string
    noProgressDesc: string
    addEntry: string
    recordMeasurements: string
    chest: string
    arms: string
    thighs: string
    hips: string
    notes: string
    notesPlaceholder: string
    // Sessions
    sessionsTab: string
    noSessions: string
    scheduled: string
    completed: string
    cancelled: string
    noShow: string
    // Payments
    paymentsTab: string
    noPayments: string
    paid: string
    pending: string
    overdue: string
    amount: string
    date: string
    status: string
    // Extra keys for hardcoded strings
    client: string
    tempo: string
    cancel: string
    saving: string
    trainingSession: string
    payment: string
    due: string
    paidLabel: string
    method: string
    failedAddProgress: string
  }
  // Social & misc labels
  social: {
    followInstagram: string
    chatWhatsApp: string
    followFacebook: string
  }
  // Alt texts
  alt: {
    gymBg: string
    coachPortrait: string
    achievements: string
    toggleMenu: string
  }
}

const en: Translations = {
  nav: {
    home: 'Home',
    about: 'About',
    services: 'Services',
    achievements: 'Achievements',
    testimonials: 'Testimonials',
    contact: 'Contact',
    bookNow: 'Book Now',
    myPortal: 'Clients',
    coachDashboard: 'Coach Dashboard',
    langToggle: 'عربي',
  },
  hero: {
    badge: 'Online Coaching',
    heading1: 'Transform Your',
    heading2: 'Body & Mind',
    description: "Cairo's elite personal trainer with 10+ years of experience transforming lives through science-based training and nutrition. Your transformation starts here.",
    startJourney: 'Start Your Journey',
    viewPrograms: 'View Programs',
    followCoach: 'Follow Coach Conan',
    yearsExp: 'Years Exp.',
    followers: 'Followers',
    results: 'Results',
    scroll: 'Scroll',
    imageAlt: 'Coach Conan - Personal Trainer',
  },
  about: {
    sectionTitle: 'About Coach Conan',
    sectionSubtitle: 'My Story',
    yearsExp: 'Years of Experience',
    clientsTrained: 'Clients Trained',
    successRate: 'Success Rate',
    satisfaction: 'Client Satisfaction',
    badge: "Cairo's Premier Fitness Coach",
    heading: 'Dedicated to Transforming Lives Through Fitness',
    p1: "With over 10 years of experience, I've helped hundreds of clients achieve their dream physiques through personalized training programs and evidence-based nutrition strategies.",
    p2: 'My approach combines scientific methodology with practical experience, ensuring every program is tailored to your unique body type, lifestyle, and goals — whether in person or online.',
    p3: "I believe fitness isn't just about looking good — it's about feeling confident, having energy, and living life to the fullest.",
    scienceBased: 'Science-Based Training',
    certified: 'Certified Professional',
    journey: 'My Journey',
    milestones: [
      { year: '2014', title: 'Started Training', desc: 'Began my journey as a certified personal trainer' },
      { year: '2016', title: 'Head Trainer', desc: 'Established as a head trainer in Cairo' },
      { year: '2018', title: 'Online Coaching', desc: 'Launched online coaching programs' },
      { year: '2020', title: '500+ Clients', desc: 'Reached 500+ successful transformations' },
      { year: '2022', title: '14K Followers', desc: 'Built a strong community on social media' },
      { year: '2024', title: 'Elite Programs', desc: 'Developed advanced coaching systems' },
    ],
  },
  services: {
    sectionTitle: 'Training Programs',
    sectionSubtitle: 'What I Offer',
    description: 'Comprehensive coaching solutions designed to help you reach your fitness goals, whether you prefer in-person training or online guidance.',
    personalTraining: 'Personal Training',
    personalTrainingDesc: 'One-on-one training sessions with personalized programs designed specifically for your goals and fitness level.',
    onlineCoaching: 'Online Coaching',
    onlineCoachingDesc: 'Get expert coaching from anywhere with custom workout plans, video calls, and continuous support through our client portal.',
    nutritionPlanning: 'Nutrition Planning',
    nutritionPlanningDesc: 'Personalized meal plans and macro calculations to fuel your training and optimize your body composition results.',
    bodyTransformation: 'Body Transformation',
    bodyTransformationDesc: 'Complete 12-week transformation programs combining training, nutrition, and accountability for maximum results.',
    mostPopular: 'MOST POPULAR',
    getStarted: 'Get Started',
    howItWorks: 'How It Works',
    theProcess: 'The Process',
    steps: [
      { title: 'Consultation', desc: 'Free assessment of your goals and current fitness level' },
      { title: 'Custom Plan', desc: 'Personalized program designed for your specific needs' },
      { title: 'Execute', desc: 'Follow the plan with ongoing support and adjustments' },
      { title: 'Transform', desc: 'Achieve your goals and maintain your results' },
    ],
    personalFeatures: ['Custom workout programs', 'Form correction & guidance', 'Progress tracking', 'Flexible scheduling'],
    onlineFeatures: ['Video call sessions', 'Custom workout plans', 'Client portal access', 'WhatsApp support'],
    nutritionFeatures: ['Macro calculations', 'Meal plan templates', 'Supplement guidance', 'Weekly adjustments'],
    bodyFeatures: ['12-week programs', 'Before & after photos', 'Weekly check-ins', 'Guaranteed results'],
  },
  pricing: {
    sectionTitle: 'Coaching Packages',
    sectionSubtitle: 'Pricing',
    description: 'Choose the package that fits your goals and budget. All packages include personalized attention and expert guidance.',
    starter: 'Starter',
    starterDesc: 'Perfect for beginners who want to start their fitness journey with professional guidance.',
    pro: 'Pro',
    proDesc: 'For dedicated individuals ready to commit to a serious transformation.',
    elite: 'Elite',
    eliteDesc: 'The ultimate coaching experience for those who demand the best results.',
    mostPopular: 'Most Popular',
    perMonth: '/month',
    currencySymbol: 'E£',
    getStarted: 'Get Started',
    starterFeatures: ['3 sessions per week', 'Basic nutrition guide', 'WhatsApp support', 'Monthly assessment'],
    proFeatures: ['5 sessions per week', 'Custom nutrition plan', 'Client portal access', 'Weekly check-ins', 'Supplement guidance', 'Progress tracking', 'Priority support'],
    eliteFeatures: ['Unlimited sessions', 'Advanced nutrition plan', '24/7 direct access', 'Daily check-ins', 'Competition prep', 'Supplement plan', 'Video form reviews', 'Guaranteed results'],
    footerNote: 'All packages include a free initial consultation. No long-term contracts required.',
  },
  results: {
    sectionTitle: 'Proven Results',
    sectionSubtitle: 'Transformations',
    description: 'Real numbers, real transformations. See what dedication and the right guidance can achieve.',
    transformations: 'Transformations',
    successRate: 'Success Rate',
    averageResults: 'Average Results',
    yearsExperience: 'Years Experience',
    weeks: '12 Weeks',
    cards: [
      { goal: 'Fat Loss', result: 'Lost 15kg in 12 weeks', testimonial: 'Coach Conan completely changed my life. His personalized approach and constant motivation helped me achieve what I thought was impossible.' },
      { goal: 'Muscle Gain', result: 'Gained 8kg of lean muscle', testimonial: "The nutrition plans and workout programs were perfectly designed for my body type. I've never felt stronger or more confident." },
      { goal: 'Athletic Performance', result: 'Increased strength by 40%', testimonial: "As an athlete, I needed specialized training. Coach Conan's science-based approach gave me the competitive edge I needed." },
      { goal: 'Body Recomposition', result: 'Lost 12kg fat, gained 4kg muscle', testimonial: 'The combination of training and nutrition was perfectly balanced. The online coaching made it convenient to stay on track.' },
    ],
  },
  certificates: {
    sectionTitle: 'Certificates & Achievements',
    sectionSubtitle: 'Qualifications',
    description: 'Continuously learning and improving to provide the best coaching experience for my clients.',
    items: [
      { title: 'NASM Certified Personal Trainer', issuer: 'National Academy of Sports Medicine', description: 'Gold standard certification for personal trainers, covering anatomy, physiology, and program design.' },
      { title: 'Precision Nutrition Level 1', issuer: 'Precision Nutrition', description: 'Evidence-based nutrition coaching certification focusing on behavior change and sustainable habits.' },
      { title: 'ACE Group Fitness Instructor', issuer: 'American Council on Exercise', description: 'Certified to lead group fitness classes with proper form instruction and safety protocols.' },
      { title: 'CrossFit Level 1 Trainer', issuer: 'CrossFit Inc.', description: 'Trained in functional movement patterns, Olympic lifts, and high-intensity programming.' },
      { title: 'ISSA Fitness Nutrition', issuer: 'International Sports Sciences Association', description: 'Advanced nutrition certification covering macro planning, supplementation, and dietary strategies.' },
      { title: 'First Aid & CPR Certified', issuer: 'American Red Cross', description: 'Current certification in emergency first aid and cardiopulmonary resuscitation.' },
    ],
    achievements: [
      { label: 'Certifications', value: '6+' },
      { label: 'Workshops Attended', value: '20+' },
      { label: 'Continuing Education', value: '100+ hrs' },
      { label: 'Years Certified', value: '10+' },
      { label: 'Specializations', value: '4' },
      { label: 'Client Success', value: '98%' },
    ],
    bannerHeading: 'Committed to Excellence',
    bannerText: 'I invest in continuous education to bring you the latest, most effective training and nutrition methods. Your success is my priority.',
    certifiedSince: 'Certified since',
  },
  testimonials: {
    sectionTitle: 'Client Success Stories',
    sectionSubtitle: 'Testimonials',
    description: 'Real people. Real results. Hear from clients who transformed their lives with Coach Conan.',
    items: [
      { name: 'Ahmed M.', role: 'Lost 20kg in 4 months', text: "Coach Conan doesn't just train your body — he transforms your mindset. The personalized approach made all the difference. I've kept the weight off for over a year now!" },
      { name: 'Sara K.', role: 'Gained 6kg muscle in 3 months', text: "As a woman, I was afraid of getting bulky. Coach Conan designed a program that helped me build lean muscle while staying feminine. Best decision I ever made!" },
      { name: 'Omar H.', role: 'Competition prep — 1st place', text: "Coach Conan's competition prep program was incredible. The attention to detail in both training and nutrition helped me win my first bodybuilding show!" },
      { name: 'Layla A.', role: 'Post-pregnancy transformation', text: "Getting back in shape after pregnancy seemed impossible until I started training with Coach Conan. He was patient, supportive, and the results speak for themselves." },
      { name: 'Youssef R.', role: 'Athletic performance improvement', text: "My speed, strength, and endurance all improved dramatically. The sport-specific training program gave me a real edge on the field." },
      { name: 'Nour E.', role: 'Lost 15kg with online coaching', text: "Even though I'm in a different city, the online coaching was just as effective. The portal made it easy to follow my programs and track progress." },
    ],
    leaveComment: 'Leave a Comment',
    commentPlaceholder: 'Share your experience with Coach Conan...',
    yourName: 'Your Name',
    submitComment: 'Submit Comment',
    submitting: 'Submitting...',
    commentSuccess: 'Thank you! Your comment will appear after review.',
    commentsSection: 'Visitor Comments',
    cancel: 'Cancel',
    rating: 'Rating',
    yourComment: 'Your Comment',
    beFirstComment: 'Be the first to leave a comment!',
  },
  faq: {
    sectionTitle: 'Common Questions',
    sectionSubtitle: 'FAQ',
    description: "Got questions? We've got answers. Find everything you need to know about training with Coach Conan.",
    items: [
      { question: 'How do I get started with Coach Conan?', answer: "Simply fill out the contact form or send a WhatsApp message. We'll schedule a free consultation to discuss your goals and create a personalized plan." },
      { question: 'What is included in the training packages?', answer: 'All packages include personalized workout programs, nutrition guidance, progress tracking, and direct communication with Coach Conan. Higher tiers include more sessions and additional features.' },
      { question: 'Can I train online if I live outside Cairo?', answer: "Absolutely! Our online coaching program is designed for clients anywhere. You'll get the same quality coaching through video calls, our client portal, and WhatsApp support." },
      { question: 'How long before I see results?', answer: 'Most clients start seeing noticeable results within 4-6 weeks. Significant transformations typically take 12 weeks, depending on your starting point and commitment level.' },
      { question: 'Do I need gym experience to start?', answer: "Not at all! Our programs are designed for all fitness levels, from complete beginners to advanced athletes. We'll meet you where you are and build from there." },
      { question: 'What makes Coach Conan different from other trainers?', answer: "Our combination of science-based training, personalized nutrition, continuous support, and a proven track record of 500+ transformations sets us apart. We're committed to your long-term success, not just quick fixes." },
    ],
    stillQuestions: 'Still have questions?',
    contactCoach: 'Contact Coach Conan',
  },
  portalCta: {
    sectionTitle: 'Clients',
    sectionSubtitle: 'Client Access',
    description: 'Your personalized coaching experience, available anytime. Track workouts, follow nutrition plans, and monitor your progress.',
    features: [
      { label: 'Workouts', desc: 'Custom programs' },
      { label: 'Nutrition', desc: 'Meal plans' },
      { label: 'Progress', desc: 'Track results' },
      { label: 'Sessions', desc: 'Schedule calls' },
    ],
    loginButton: 'Client Login',
    portalHeader: 'Client Portal',
    todayWorkout: "Today's Workout",
    active: 'Active',
    nutritionPlan: 'Nutrition Plan',
    progress: 'Progress',
    nextSession: 'Next Session',
    portalName: 'Clients',
    mockWorkoutDesc: 'Upper Body Push — 6 exercises',
    mockCalories: '1,850 kcal',
    mockProtein: 'Protein',
    mockCarbs: 'Carbs',
    mockFats: 'Fats',
    mockWeightLoss: '▼ 2.5kg this week',
    mockTomorrow: 'Tomorrow, 10 AM',
  },
  dashboard: {
    dashboard: 'Dashboard',
    clients: 'Clients',
    clientData: 'Client Data',
    workouts: 'Workouts',
    nutrition: 'Nutrition',
    progress: 'Progress',
    sessions: 'Sessions',
    payments: 'Payments',
    settings: 'Settings',
    signOut: 'Sign Out',
    backToWebsite: 'Back to Website',
    totalClients: 'Total Clients',
    activeClients: 'Active Clients',
    sessionsThisWeek: 'Sessions This Week',
    revenueThisMonth: 'Revenue This Month',
    revenueOverview: 'Revenue Overview',
    totalRevenue: 'Total Revenue',
    pendingPayments: 'Pending Payments',
    overdue: 'Overdue',
    vsLastMonth: 'vs last month',
    quickActions: 'Quick Actions',
    addClient: 'Add Client',
    registerNewClient: 'Register new client',
    createWorkout: 'Create Workout',
    designWorkoutPlan: 'Design workout plan',
    scheduleSession: 'Schedule Session',
    bookTrainingSession: 'Book training session',
    upcomingSessions: 'Upcoming Sessions',
    noUpcomingSessions: 'No upcoming sessions',
    scheduledSessionsWillAppear: 'Scheduled sessions will appear here',
    viewAll: 'View All',
    recentActivity: 'Recent Activity',
    noRecentActivity: 'No recent activity',
    activityLogsWillAppear: 'Activity logs will appear here',
    clientPortal: 'Client Portal',
    website: 'Website',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    justNow: 'Just now',
    minutesAgo: 'm ago',
    hoursAgo: 'h ago',
    daysAgo: 'd ago',
    clientFallback: 'Client',
    trainingFallback: 'Training',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    done: 'Done',
    update: 'Update',
    saving: 'Saving...',
    create: 'Create',
    allClients: 'All Clients',
    selectClient: 'Select client',
    filterByClient: 'Filter by client',
    male: 'Male',
    female: 'Female',
    active: 'Active',
    inactive: 'Inactive',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
    cancelled: 'Cancelled',
    scheduled: 'Scheduled',
    paid: 'Paid',
    draft: 'Draft',
    tryAgain: 'Try Again',
    unknown: 'Unknown',
    revenue: 'Revenue',
    manageClients: 'Manage your coaching clients',
    allClientsTab: 'All Clients',
    pendingApprovalTab: 'Pending Approval',
    noClientsFound: 'No clients found',
    addFirstClient: 'Add your first client to get started',
    noPendingApprovals: 'No pending approvals',
    allRegistrationsReviewed: 'All client registrations have been reviewed',
    searchClients: 'Search clients by name, email, or phone...',
    clientApproved: 'Client approved successfully',
    clientRejected: 'Client rejected',
    approveFailed: 'Failed to approve client',
    rejectFailed: 'Failed to reject client',
    clientUpdated: 'Client updated successfully',
    clientCreated: 'Client created successfully',
    clientDeactivated: 'Client deleted from system',
    deactivateFailed: 'Failed to delete client',
    saveClientFailed: 'Failed to save client',
    nameEmailRequired: 'Name and email are required',
    editClientTitle: 'Edit Client',
    addNewClientTitle: 'Add New Client',
    updateClientInfo: 'Update client information',
    registerNewClientDesc: 'Register a new coaching client',
    fullNamePlaceholder: 'Full name',
    emailPlaceholderDash: 'email@example.com',
    phonePlaceholderDash: '+20 xxx xxx xxxx',
    agePlaceholderDash: 'Age',
    selectOption: 'Select',
    goalPlaceholderDash: 'e.g., Weight loss, Muscle gain',
    createWithPortalAccess: 'Create with Portal Access',
    autoGenCredentials: 'Auto-generate login credentials for the Client Portal',
    securePasswordNote: 'A secure password will be auto-generated. The client will be pre-approved and can immediately log in to the Client Portal using the credentials provided after creation.',
    createGenerateCreds: 'Create & Generate Credentials',
    clientPortalCredentials: 'Client Portal Credentials',
    shareCredentials: 'Share these credentials with the client so they can log in to the Client Portal',
    emailUpper: 'EMAIL',
    passwordUpper: 'PASSWORD',
    shareSecurely: 'Make sure to share these credentials securely with the client. The password will not be shown again after closing this dialog.',
    passwordNotShownAgain: 'The password will not be shown again after closing this dialog.',
    copyCredentials: 'Copy Credentials',
    copiedToClipboard: 'Credentials copied to clipboard',
    copyFailed: 'Failed to copy. Please copy manually.',
    deleteClientTitle: 'Delete Client',
    deactivateClientConfirm: 'Are you sure you want to permanently delete this client? This will remove them and all their data from the system. This action cannot be undone.',
    clientSince: 'Client since',
    ageYears: 'years',
    weightKg: 'Weight (kg)',
    heightCm: 'Height (cm)',
    statusLabel: 'Status',
    approvalLabel: 'Approval',
    noWorkoutPlansYet: 'No workout plans yet',
    noNutritionPlansYet: 'No nutrition plans yet',
    noProgressEntriesYet: 'No progress entries yet',
    noSessionsFoundDetail: 'No sessions found',
    noFrequencySet: 'No frequency set',
    noCaloriesSet: 'No calories set',
    pendingApprovalLabel: 'Pending Approval',
    rejectedLabel: 'Rejected',
    approvedLabel: 'Approved',
    approveBtn: 'Approve',
    rejectBtn: 'Reject',
    profileImage: 'Profile Image',
    uploadImage: 'Upload Image',
    uploading: 'Uploading...',
    maxSize2MB: 'Max 5MB, JPG/PNG (auto-compressed)',
    remove: 'Remove',
    notesLabel: 'Notes',
    phoneOrEmailRequired: 'Phone number or email is required',
    forPortalAccess: 'for client portal login',
    workoutPrograms: 'Workout Programs',
    manageWorkouts: 'Create and manage workout programs',
    createProgram: 'Create Program',
    searchWorkouts: 'Search workouts...',
    noWorkoutPrograms: 'No workout programs found',
    createFirstProgram: 'Create your first program',
    editWorkoutTitle: 'Edit Workout Program',
    createWorkoutTitle: 'Create Workout Program',
    updateWorkoutDesc: 'Update the workout program details and structure',
    designWorkoutDesc: 'Design a new workout program with the visual builder',
    basicInfo: 'Basic Info',
    planNameLabel: 'Plan Name',
    clientRequired: 'Client',
    frequencyLabel: 'Frequency',
    durationWeeks: 'Duration (weeks)',
    descriptionLabel: 'Description',
    programBuilder: 'Program Builder',
    addWeek: 'Add Week',
    noWeeksAdded: 'No weeks added yet',
    addFirstWeek: 'Add your first week',
    weekNameOptional: 'Week name (optional)',
    restLabel: 'Rest',
    exerciseName: 'Exercise name',
    muscleGroup: 'Muscle group',
    sets: 'Sets',
    reps: 'Reps',
    weightKgField: 'Weight (kg)',
    restSeconds: 'Rest (s)',
    tempo: 'Tempo',
    addExercise: 'Add Exercise',
    addDay: 'Add Day',
    duplicateBtn: 'Duplicate',
    deleteWorkoutTitle: 'Delete Workout Program',
    deleteWorkoutConfirm: 'Are you sure you want to delete this workout program? This action cannot be undone.',
    nameClientRequired: 'Name and client are required',
    saveWorkoutFailed: 'Failed to save workout program',
    weekLabel: 'Week',
    restAndRecovery: 'Rest & Recovery',
    noExercisesDefined: 'No exercises defined',
    noDaysDefined: 'No days defined for this week',
    noWeeksDefined: 'No weeks defined for this program',
    dayLabel: 'Day',
    weekSingular: 'week',
    weekPlural: 'weeks',
    daySingular: 'day',
    dayPlural: 'days',
    planNamePlaceholder: 'e.g., Upper Body Strength',
    frequencyPlaceholder: 'e.g., 4 days/week',
    descriptionPlaceholder: 'Program description...',
    nutritionPlans: 'Nutrition Plans',
    manageNutrition: 'Create and manage nutrition programs',
    createPlan: 'Create Plan',
    searchPlans: 'Search plans...',
    noNutritionPlans: 'No nutrition plans found',
    createFirstNutritionPlan: 'Create your first nutrition plan to get started',
    editNutritionTitle: 'Edit Nutrition Plan',
    createNutritionTitle: 'Create Nutrition Plan',
    updateNutritionDesc: 'Update the nutrition program',
    designNutritionDesc: 'Design a nutrition program for your client',
    planNameLabel: 'Plan Name',
    descriptionOptional: 'Description',
    dailyMacros: 'Daily Macros',
    caloriesKcal: 'Calories (kcal)',
    proteinG: 'Protein (g)',
    carbsG: 'Carbs (g)',
    fatsG: 'Fats (g)',
    fiberG: 'Fiber (g)',
    fiberOptional: 'Fiber (g) — optional',
    waterMl: 'Water (ml)',
    autoCalculated: 'Auto-calculated from food items:',
    autoCalcFromFood: 'Auto-calculate from food items',
    foodNameLabel: 'Food Name',
    dateRangeOptional: 'Date Range (optional)',
    startDate: 'Start Date',
    endDate: 'End Date',
    mealsBuilder: 'Meals Builder',
    addMeal: 'Add Meal',
    mealType: 'Meal Type',
    mealName: 'Meal Name',
    timeLabel: 'Time',
    foodItems: 'Food Items',
    addFoodItem: 'Add Food Item',
    quantityLabel: 'Quantity',
    unitLabel: 'Unit',
    caloriesLabel: 'Calories',
    untitledMeal: 'Untitled Meal',
    itemLabel: 'item',
    itemsLabel: 'items',
    macroSummary: 'Macro Summary',
    dailyWaterTarget: 'Daily Water Target',
    planDuration: 'Plan Duration',
    mealsLabel: 'Meals',
    noMealsDefined: 'No meals defined for this plan',
    noFoodItemsAdded: 'No food items added',
    deleteNutritionTitle: 'Delete Nutrition Plan',
    deleteNutritionConfirm: 'Are you sure you want to delete this nutrition plan? This action cannot be undone.',
    nameClientRequiredNutrition: 'Name and client are required',
    saveNutritionFailed: 'Failed to save nutrition plan',
    breakfast: 'Breakfast',
    snack: 'Snack',
    lunch: 'Lunch',
    dinner: 'Dinner',
    preWorkout: 'Pre-Workout',
    postWorkout: 'Post-Workout',
    custom: 'Custom',
    progressTracker: 'Progress Tracker',
    trackProgress: 'Track client measurements and progress',
    addEntry: 'Add Entry',
    selectClientLabel: 'Select Client:',
    chooseClient: 'Choose a client...',
    selectClientTitle: 'Select a Client',
    chooseClientProgress: 'Choose a client to view their progress history',
    weightProgress: 'Weight Progress',
    weightKgChart: 'Weight (kg)',
    progressHistory: 'Progress History',
    noProgressEntries: 'No progress entries yet',
    addFirstEntry: 'Add the first entry to start tracking',
    weightLabel: 'Weight',
    bodyFatLabel: 'Body Fat',
    muscleLabel: 'Muscle',
    waistLabel: 'Waist',
    chestLabel: 'Chest',
    armsLabel: 'Arms',
    thighsLabel: 'Thighs',
    addProgressTitle: 'Add Progress Entry',
    recordMeasurementsFor: 'Record new measurements for',
    weightKgField: 'Weight (kg)',
    bodyFatPercent: 'Body Fat (%)',
    muscleMassKg: 'Muscle Mass (kg)',
    waistCm: 'Waist (cm)',
    chestCm: 'Chest (cm)',
    armsCm: 'Arms (cm)',
    thighsCm: 'Thighs (cm)',
    additionalNotes: 'Additional notes...',
    deleteEntryTitle: 'Delete Entry',
    deleteEntryConfirm: 'Are you sure you want to delete this progress entry?',
    selectClientFirst: 'Please select a client first',
    saveProgressFailed: 'Failed to add progress entry',
    sessionsTitle: 'Sessions',
    manageSessions: 'Manage training sessions and schedule',
    scheduleSessionBtn: 'Schedule Session',
    searchSessions: 'Search sessions...',
    upcomingSessionsTitle: 'Upcoming Sessions',
    noSessionsTitle: 'No Sessions',
    scheduleFirstSession: 'Schedule your first training session',
    editSessionTitle: 'Edit Session',
    scheduleSessionTitle: 'Schedule Session',
    updateSessionDesc: 'Update session details',
    bookSessionDesc: 'Book a new training session',
    clientRequiredSession: 'Client',
    dateTimeRequired: 'Date & Time',
    durationMin: 'Duration (min)',
    typeLabel: 'Type',
    selectType: 'Select type',
    sessionNotes: 'Session notes...',
    scheduleBtn: 'Schedule',
    deleteSessionTitle: 'Delete Session',
    deleteSessionConfirm: 'Are you sure you want to delete this session?',
    clientDateRequired: 'Client and date are required',
    saveSessionFailed: 'Failed to save session',
    personalTrainingSession: 'Personal Training',
    onlineCoachingSession: 'Online Coaching',
    groupTraining: 'Group Training',
    assessment: 'Assessment',
    consultation: 'Consultation',
    followUp: 'Follow-up',
    scheduledLabel: 'Scheduled',
    completedLabel: 'Completed',
    cancelledLabel: 'Cancelled',
    allStatus: 'All Status',
    paymentsTitle: 'Payments',
    trackPayments: 'Track payments, invoices, and revenue',
    recordPaymentBtn: 'Record Payment',
    totalRevenueLabel: 'Total Revenue',
    thisMonthLabel: 'This Month',
    pendingLabel: 'Pending',
    overdueLabel: 'Overdue',
    searchPayments: 'Search by client, description, invoice...',
    paidLabel: 'Paid',
    noPayments: 'No Payments',
    recordFirstPayment: 'Record your first payment to get started',
    markPaid: 'Mark Paid',
    dueLabel: 'Due',
    paidLabelDate: 'Paid',
    editPaymentTitle: 'Edit Payment',
    recordPaymentTitle: 'Record Payment',
    updatePaymentDesc: 'Update payment details',
    recordNewPayment: 'Record a new payment',
    clientRequiredPayment: 'Client',
    amountRequired: 'Amount',
    amountLabel: 'Amount',
    currencyLabel: 'Currency',
    dueDateLabel: 'Due Date',
    paymentMethodLabel: 'Payment Method',
    selectMethod: 'Select method',
    deletePaymentTitle: 'Delete Payment',
    deletePaymentConfirm: 'Are you sure you want to delete this payment? This action cannot be undone.',
    clientAmountRequired: 'Client and amount are required',
    validAmountRequired: 'Please enter a valid amount',
    savePaymentFailed: 'Failed to save payment',
    cash: 'Cash',
    bankTransfer: 'Bank Transfer',
    creditCard: 'Credit Card',
    debitCard: 'Debit Card',
    mobilePayment: 'Mobile Payment',
    onlineTransfer: 'Online Transfer',
    checkPayment: 'Check',
    otherPayment: 'Other',
    settingsTitle: 'Settings',
    manageProfileSecurity: 'Manage your profile and security preferences',
    profileTab: 'Profile',
    securityTab: 'Security',
    editProfile: 'Edit Profile',
    fullName: 'Full Name',
    profileImageUrl: 'Profile Image URL',
    enterFullName: 'Enter your full name',
    profileImagePlaceholder: 'https://example.com/avatar.jpg',
    pasteUrlNote: 'Paste a URL to your profile picture. Leave empty to use initials.',
    imagePreview: 'Image Preview',
    saveChanges: 'Save Changes',
    savingChanges: 'Saving...',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPasswordLabel: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    enterCurrentPassword: 'Enter current password',
    enterNewPassword: 'Enter new password',
    confirmNewPasswordPlaceholder: 'Confirm new password',
    hidePassword: 'Hide password',
    showPassword: 'Show password',
    passwordsDoNotMatch: 'Passwords do not match',
    passwordsMatchLabel: 'Passwords match',
    passwordRequirementsLabel: 'Password Requirements',
    allRequirementsMet: 'All requirements met',
    accountLockoutPolicy: 'Account Lockout Policy',
    lockoutPolicyDesc: 'After 5 failed login attempts, your account will be locked for 15 minutes for security purposes. If you get locked out, wait for the cooldown period before trying again.',
    dangerZone: 'Danger Zone',
    irreversibleActions: 'Irreversible actions that affect your account access',
    signOutAllDevices: 'Sign Out of All Devices',
    nameRequired: 'Name is required',
    nameMinLength: 'Name must be at least 2 characters',
    invalidUrl: 'Must be a valid URL starting with http(s)://',
    profileUpdated: 'Profile updated successfully',
    profileUpdateFailed: 'Failed to update profile',
    currentPasswordRequired: 'Current password is required',
    passwordNotMeetReqs: 'Password does not meet all requirements',
    newPasswordsNoMatch: 'New passwords do not match',
    passwordChanged: 'Password changed successfully',
    passwordChangeFailed: 'Failed to change password',
    signedOutAllDevices: 'Signed out of all devices',
    atLeast8Chars: 'At least 8 characters',
    oneUppercase: 'One uppercase letter',
    oneLowercase: 'One lowercase letter',
    oneNumber: 'One number',
    oneSpecialChar: 'One special character',
    emailInfoLabel: 'Email',
    memberSince: 'Member Since',
    lastLogin: 'Last Login',
    notAvailable: 'N/A',
    clientSpreadsheet: 'Client Spreadsheet',
    fullClientDetails: 'Full client details in spreadsheet view',
    exportCSVLabel: 'Export CSV',
    totalClientsLabel: 'Total Clients',
    activeClientsLabel: 'Active Clients',
    pendingApprovalLabel: 'Pending Approval',
    avgWeightKg: 'Avg Weight (kg)',
    searchByNameEmailPhone: 'Search by name, email, or phone...',
    statusFilter: 'Status',
    approvalFilter: 'Approval',
    allApproval: 'All Approval',
    showingOfClients: 'clients',
    numberHeader: '#',
    fullNameHeader: 'Full Name',
    emailHeader: 'Email',
    phoneHeader: 'Phone',
    ageHeader: 'Age',
    genderHeader: 'Gender',
    weightKgHeader: 'Weight (kg)',
    heightCmHeader: 'Height (cm)',
    goalHeader: 'Goal',
    statusHeader: 'Status',
    approvalHeader: 'Approval',
    startDateHeader: 'Start Date',
    registeredHeader: 'Registered',
    noClientsFoundTable: 'No clients found',
    adjustSearchFilter: 'Adjust your search or filter criteria',
    failedToLoadClients: 'Failed to Load Clients',
    tryAgainBtn: 'Try Again',
    csvExported: 'CSV exported successfully',
    failedToLoadClientsError: 'Failed to load clients',
  },
  contact: {
    sectionTitle: 'Contact Me',
    sectionSubtitle: 'Contact Me',
    description: 'Ready to start your transformation? Reach out and let\'s discuss how I can help you achieve your fitness goals.',
    location: 'Location',
    locationDetail: 'Cairo, Egypt',
    phone: 'Phone',
    phoneDetail: 'Available daily 8AM - 10PM',
    email: 'Email',
    emailDetail: 'Response within 24 hours',
    workingHours: 'Working Hours',
    workingHoursDetail: 'Sat - Thu: 8AM - 10PM',
    connectWithMe: 'Connect With Me',
    instagram: 'Instagram',
    whatsapp: 'WhatsApp',
    facebook: 'Facebook',
    direct: 'Direct',
    follow: 'Follow',
    formHeading: 'Send a Message',
    formDescription: 'Fill out the form below and Coach Conan will get back to you within 24 hours.',
    successHeading: 'Message Sent!',
    successText: 'Coach Conan will get back to you soon.',
    fullName: 'Full Name',
    fullNamePlaceholder: 'Your name',
    emailLabel: 'Email',
    emailPlaceholder: 'your@email.com',
    phoneLabel: 'Phone',
    phonePlaceholder: '+20 xxx xxx xxxx',
    interestedIn: 'Interested In',
    selectService: 'Select a service',
    personalTraining: 'Personal Training',
    onlineCoaching: 'Online Coaching',
    nutritionPlanning: 'Nutrition Planning',
    bodyTransformation: 'Body Transformation',
    message: 'Message',
    messagePlaceholder: 'Tell me about your fitness goals...',
    sending: 'Sending...',
    sendMessage: 'Send Message',
    somethingWentWrong: 'Something went wrong',
    failedToSend: 'Failed to send message',
  },
  footer: {
    brandDescription: "Cairo's premier personal trainer. Transforming lives through dedicated coaching, personalized programs, and unwavering support.",
    quickLinks: 'Quick Links',
    services: 'Services',
    getInTouch: 'Get In Touch',
    chatWhatsApp: 'Chat on WhatsApp',
    copyright: 'Coach Conan. All rights reserved.',
    madeWith: 'Made with ❤ in Cairo, Egypt',
    home: 'Home',
    about: 'About',
    servicesNav: 'Services',
    achievements: 'Achievements',
    testimonials: 'Testimonials',
    contact: 'Contact',
  },
  coachLogin: {
    title: 'Coach Dashboard',
    subtitle: 'Sign in to manage your coaching business',
    email: 'Email',
    emailPlaceholder: 'coach@example.com',
    password: 'Password',
    passwordPlaceholder: '••••••••',
    signIn: 'Sign In',
    backToWebsite: 'Back to Website',
    loginFailed: 'Login failed',
  },
  clientLogin: {
    signIn: 'Sign In',
    register: 'Register',
    email: 'Email',
    emailPlaceholder: 'your@email.com',
    password: 'Password',
    passwordPlaceholder: '••••••••',
    fullName: 'Full Name',
    fullNamePlaceholder: 'Your full name',
    confirmPassword: 'Confirm Password',
    confirmPlaceholder: 'Confirm',
    phone: 'Phone',
    phonePlaceholder: '+20 xxx xxx xxxx',
    age: 'Age',
    agePlaceholder: 'Age',
    gender: 'Gender',
    genderPlaceholder: 'Select',
    weight: 'Weight (kg)',
    weightPlaceholder: 'kg',
    height: 'Height (cm)',
    heightPlaceholder: 'cm',
    goal: 'Goal',
    goalPlaceholder: 'Select your goal',
    createAccount: 'Create Account',
    fixErrors: 'Please fix the errors above',
    passwordMatch: 'Passwords match',
    passwordNoMatch: "Passwords don't match",
    passwordRequirements: 'Password requirements:',
    minChars: 'At least 8 characters',
    uppercase: 'One uppercase letter (A-Z)',
    lowercase: 'One lowercase letter (a-z)',
    number: 'One number (0-9)',
    specialChar: 'One special character (!@#$...)',
    pendingApproval: 'Your registration is pending coach approval. Please check back later.',
    accountRejected: 'Your account has been rejected. Please contact your coach for more information.',
    registrationSuccess: 'Registration successful! Your account is pending coach approval. You will be able to log in once approved.',
    loginFailed: 'Login failed',
    nameRequired: 'Full name is required',
    nameMinLength: 'Name must be at least 2 characters',
    emailRequired: 'Email is required',
    emailInvalid: 'Please enter a valid email address',
    passwordRequired: 'Password is required',
    passwordMinLength: 'Password must be at least 8 characters',
    passwordUppercase: 'Password must contain an uppercase letter',
    passwordLowercase: 'Password must contain a lowercase letter',
    passwordNumber: 'Password must contain a number',
    passwordSpecial: 'Password must contain a special character',
    confirmRequired: 'Please confirm your password',
    confirmNoMatch: 'Passwords do not match',
    ageInvalid: 'Age must be a whole number',
    weightInvalid: 'Weight must be a number',
    heightInvalid: 'Height must be a number',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    weightLoss: 'Weight Loss',
    muscleGain: 'Muscle Gain',
    bodyRecomposition: 'Body Recomposition',
    strength: 'Strength',
    endurance: 'Endurance',
    flexibility: 'Flexibility',
    generalFitness: 'General Fitness',
    sportsPerformance: 'Sports Performance',
  },
  clientDash: {
    welcomeBack: 'Welcome back',
    trainingOverview: "Here's your training overview",
    weight: 'Weight (kg)',
    goalLabel: 'Goal',
    activeProgram: 'Active Program',
    nextSession: 'Next Session',
    none: 'None',
    latestMeasurements: 'Latest Measurements',
    recordedOn: 'Recorded on',
    bodyFat: 'Body Fat',
    muscleMass: 'Muscle Mass',
    waist: 'Waist',
    overview: 'Overview',
    workouts: 'Workouts',
    nutrition: 'Nutrition',
    progress: 'Progress',
    sessions: 'Sessions',
    payments: 'Payments',
    workoutPrograms: 'Workout Programs',
    assignedPrograms: 'Your assigned training programs',
    noWorkouts: 'No Workouts Assigned',
    noWorkoutsDesc: 'Your coach will assign workout programs here',
    week: 'Week',
    day: 'Day',
    days: 'days',
    restDay: 'Rest Day',
    restRecovery: 'Rest & Recovery',
    noExercises: 'No exercises defined',
    noProgramDetails: 'No program details available',
    nutritionPlans: 'Nutrition Plans',
    assignedPlans: 'Your assigned nutrition programs',
    noNutrition: 'No Nutrition Plans',
    noNutritionDesc: 'Your coach will assign nutrition plans here',
    dailyMacros: 'Daily Macros',
    calories: 'Calories (kcal)',
    protein: 'Protein',
    carbs: 'Carbs',
    fats: 'Fats',
    meals: 'Meals',
    meal: 'meal',
    dailyWater: 'Daily Water Target',
    planDuration: 'Plan Duration',
    noMeals: 'No meals defined for this plan',
    noFoodItems: 'No food items added',
    progressTracking: 'Progress Tracking',
    trackMeasurements: 'Track your measurements over time',
    addProgress: 'Add Progress Entry',
    weightProgress: 'Weight Progress',
    progressHistory: 'Progress History',
    noProgress: 'No progress entries yet',
    noProgressDesc: 'Add your first entry to start tracking',
    addEntry: 'Add Progress Entry',
    recordMeasurements: 'Record your measurements',
    chest: 'Chest',
    arms: 'Arms',
    thighs: 'Thighs',
    hips: 'Hips',
    notes: 'Notes',
    notesPlaceholder: 'Any notes...',
    sessionsTab: 'Sessions',
    noSessions: 'No sessions scheduled',
    scheduled: 'scheduled',
    completed: 'completed',
    cancelled: 'cancelled',
    noShow: 'no-show',
    paymentsTab: 'Payments',
    noPayments: 'No payments found',
    paid: 'paid',
    pending: 'pending',
    overdue: 'overdue',
    amount: 'Amount',
    date: 'Date',
    status: 'Status',
    client: 'Client',
    tempo: 'Tempo',
    cancel: 'Cancel',
    saving: 'Saving...',
    trainingSession: 'Training Session',
    payment: 'Payment',
    due: 'Due',
    paidLabel: 'Paid',
    method: 'Method',
    failedAddProgress: 'Failed to add progress entry',
  },
  social: {
    followInstagram: 'Follow on Instagram',
    chatWhatsApp: 'Chat on WhatsApp',
    followFacebook: 'Follow on Facebook',
  },
  alt: {
    gymBg: 'Gym Background',
    coachPortrait: 'Coach Conan Portrait',
    achievements: 'Achievements',
    toggleMenu: 'Toggle menu',
  },
}

const ar: Translations = {
  nav: {
    home: 'الرئيسية',
    about: 'عني',
    services: 'الخدمات',
    achievements: 'الإنجازات',
    testimonials: 'آراء العملاء',
    contact: 'تواصل',
    bookNow: 'احجز الآن',
    myPortal: 'العملاء',
    coachDashboard: 'لوحة المدرب',
    langToggle: 'EN',
  },
  hero: {
    badge: 'تدريب أونلاين',
    heading1: 'حوّل جسمك',
    heading2: 'وعقلك',
    description: 'مدرب شخصي نخبة في القاهرة مع أكثر من 10 سنوات خبرة في تحويل الحياة من خلال التدريب العلمي والتغذية. تحولك يبدأ هنا.',
    startJourney: 'ابدأ رحلتك',
    viewPrograms: 'شاهد البرامج',
    followCoach: 'تابع كوتش كونان',
    yearsExp: 'سنوات خبرة',
    followers: 'متابع',
    results: 'نتيجة',
    scroll: 'مرر',
    imageAlt: 'كوتش كونان - مدرب شخصي',
  },
  about: {
    sectionTitle: 'عن كوتش كونان',
    sectionSubtitle: 'قصتي',
    yearsExp: 'سنوات الخبرة',
    clientsTrained: 'عميل دربتهم',
    successRate: 'نسبة النجاح',
    satisfaction: 'رضا العملاء',
    badge: 'أفضل مدرب لياقة في القاهرة',
    heading: 'مكرس لتحويل الحياة عبر اللياقة',
    p1: 'مع أكثر من 10 سنوات خبرة، ساعدت مئات العملاء في تحقيق الجسم المثالي من خلال برامج تدريب شخصية واستراتيجيات تغذية مبنية على الأدلة العلمية.',
    p2: 'نهجي يجمع بين المنهجية العلمية والخبرة العملية، لضمان أن كل برنامج مصمم خصيصاً لنوع جسمك وأسلوب حياتك وأهدافك — سواء شخصياً أو أونلاين.',
    p3: 'أؤمن أن اللياقة ليست مجرد مظهر جيد — إنها شعور بالثقة، الطاقة، والعيش بحياة كاملة.',
    scienceBased: 'تدريب علمي',
    certified: 'معتمد مهنياً',
    journey: 'رحلتي',
    milestones: [
      { year: '2014', title: 'بدأت التدريب', desc: 'بدأت رحلتي كمدرب شخصي معتمد' },
      { year: '2016', title: 'مدرب رئيسي', desc: 'أصبحت مدرباً رئيسياً في القاهرة' },
      { year: '2018', title: 'التدريب أونلاين', desc: 'أطلقت برامج التدريب أونلاين' },
      { year: '2020', title: '+500 عميل', desc: 'وصلت لـ 500+ تحول ناجح' },
      { year: '2022', title: '14K متابع', desc: 'بنت مجتمع قوي على السوشيال ميديا' },
      { year: '2024', title: 'برامج متقدمة', desc: 'طورت أنظمة تدريب متقدمة' },
    ],
  },
  services: {
    sectionTitle: 'برامج التدريب',
    sectionSubtitle: 'ما أقدمه',
    description: 'حلول تدريب شاملة مصممة لمساعدتك في الوصول لأهداف اللياقة، سواء كنت تفضل التدريب الشخصي أو التوجيه أونلاين.',
    personalTraining: 'تدريب شخصي',
    personalTrainingDesc: 'جلسات تدريب فردية مع برامج شخصية مصممة خصيصاً لأهدافك ومستوى لياقتك.',
    onlineCoaching: 'تدريب أونلاين',
    onlineCoachingDesc: 'احصل على تدريب خبير من أي مكان مع خطط تمارين مخصصة ومكالمات فيديو ودعم مستمر عبر بوابة العملاء.',
    nutritionPlanning: 'تخطيط التغذية',
    nutritionPlanningDesc: 'خطط وجبات شخصية وحساب الماكرو لتغذية تمارينك وتحسين نتائج تكوين جسمك.',
    bodyTransformation: 'تحويل الجسم',
    bodyTransformationDesc: 'برامج تحويل كاملة لمدة 12 أسبوع تجمع بين التدريب والتغذية والمتابعة لنتائج قصوى.',
    mostPopular: 'الأكثر شعبية',
    getStarted: 'ابدأ الآن',
    howItWorks: 'كيف يعمل',
    theProcess: 'الخطوات',
    steps: [
      { title: 'استشارة', desc: 'تقييم مجاني لأهدافك ومستوى لياقتك الحالي' },
      { title: 'خطة مخصصة', desc: 'برنامج شخصي مصمم لاحتياجاتك المحددة' },
      { title: 'تنفيذ', desc: 'اتبع الخطة مع دعم مستمر وتعديلات' },
      { title: 'تحول', desc: 'حقق أهدافك وحافظ على نتائجك' },
    ],
    personalFeatures: ['برامج تمارين مخصصة', 'تصحيح الأوضاع والتوجيه', 'تتبع التقدم', 'جداول مرنة'],
    onlineFeatures: ['جلسات مكالمة فيديو', 'خطط تمارين مخصصة', 'الوصول لبوابة العملاء', 'دعم واتساب'],
    nutritionFeatures: ['حساب الماكرو', 'قوالب خطط الوجبات', 'إرشاد المكملات', 'تعديلات أسبوعية'],
    bodyFeatures: ['برامج 12 أسبوع', 'صور قبل وبعد', 'متابعة أسبوعية', 'نتائج مضمونة'],
  },
  pricing: {
    sectionTitle: 'باقات التدريب',
    sectionSubtitle: 'الأسعار',
    description: 'اختر الباقة التي تناسب أهدافك وميزانيتك. جميع الباقات تشمل اهتمام شخصي وتوجيه خبير.',
    starter: 'المبتدئ',
    starterDesc: 'مثالي للمبتدئين الذين يريدون بدء رحلتهم في اللياقة مع توجيه احترافي.',
    pro: 'المحترف',
    proDesc: 'للأفراد المتفانين المستعدين للالتزام بتحول حقيقي.',
    elite: 'النخبة',
    eliteDesc: 'تجربة التدريب المثالية لمن يطالبون بأفضل النتائج.',
    mostPopular: 'الأكثر شعبية',
    perMonth: '/شهر',
    currencySymbol: 'ج.م',
    getStarted: 'ابدأ الآن',
    starterFeatures: ['3 جلسات أسبوعياً', 'دليل تغذية أساسي', 'دعم واتساب', 'تقييم شهري'],
    proFeatures: ['5 جلسات أسبوعياً', 'خطة تغذية مخصصة', 'الوصول لبوابة العملاء', 'متابعة أسبوعية', 'إرشاد المكملات', 'تتبع التقدم', 'دعم أولوية'],
    eliteFeatures: ['جلسات غير محدودة', 'خطة تغذية متقدمة', 'تواصل مباشر 24/7', 'متابعة يومية', 'تحضير مسابقات', 'خطة مكملات', 'مراجعة الأوضاع بالفيديو', 'نتائج مضمونة'],
    footerNote: 'جميع الباقات تشمل استشارة أولية مجانية. لا توجد عقود طويلة الأجل.',
  },
  results: {
    sectionTitle: 'نتائج مثبتة',
    sectionSubtitle: 'التحولات',
    description: 'أرقام حقيقية، تحولات حقيقية. شاهد ما يمكن تحقيقه بالتفاني والتوجيه الصحيح.',
    transformations: 'تحول',
    successRate: 'نسبة النجاح',
    averageResults: 'متوسط النتائج',
    yearsExperience: 'سنوات خبرة',
    weeks: '12 أسبوع',
    cards: [
      { goal: 'خسارة دهون', result: 'خسر 15 كجم في 12 أسبوع', testimonial: 'كوتش كونان غيّر حياتي بالكامل. نهجه الشخصي وتحفيزه المستمر ساعداني على تحقيق ما كنت أظنه مستحيلاً.' },
      { goal: 'زيادة عضلات', result: 'اكتسب 8 كجم عضلات نقية', testimonial: 'خطط التغذية والتمارين كانت مصممة بشكل مثالي لنوع جسمي. لم أشعر بقوة وثقة أكبر من ذلك.' },
      { goal: 'أداء رياضي', result: 'زيادة القوة بنسبة 40%', testimonial: 'كرياضي، احتجت تدريباً متخصصاً. نهج كوتش كونان العلمي أعطاني الميزة التنافسية التي أحتاجها.' },
      { goal: 'إعادة تشكيل الجسم', result: 'خسر 12 كجم دهون واكتسب 4 كجم عضلات', testimonial: 'مزيج التدريب والتغذية كان متوازناً بشكل مثالي. التدريب أونلاين جعل من السهل البقاء على المسار.' },
    ],
  },
  certificates: {
    sectionTitle: 'الشهادات والإنجازات',
    sectionSubtitle: 'المؤهلات',
    description: 'تعلم وتطوير مستمر لتقديم أفضل تجربة تدريب لعملائي.',
    items: [
      { title: 'مدرب شخصي معتمد NASM', issuer: 'الأكاديمية الوطنية للطب الرياضي', description: 'شهادة معيار ذهبية للمدربين الشخصيين، تغطي التشريح والفيزيولوجيا وتصميم البرامج.' },
      { title: 'التغذية الدقيقة المستوى 1', issuer: 'بريسيشن نيوتريشن', description: 'شهادة تدريب تغذية مبنية على الأدلة تركز على تغيير السلوك والعادات المستدامة.' },
      { title: 'مدرب لياقة جماعية ACE', issuer: 'المجلس الأمريكي للتمرين', description: 'معتمد لقيادة فصول اللياقة الجماعية مع تعليم الأوضاع الصحيحة وبروتوكولات السلامة.' },
      { title: 'مدرب كروسفيت المستوى 1', issuer: 'كروسفيت إنك', description: 'مدرب في أنماط الحركة الوظيفية ورفع الأثقال الأولمبي والبرمجة عالية الكثافة.' },
      { title: 'تغذية رياضية ISSA', issuer: 'الرابطة الدولية للعلوم الرياضية', description: 'شهادة تغذية متقدمة تغطي تخطيط الماكرو والمكملات والاستراتيجيات الغذائية.' },
      { title: 'إسعافات أولية وإنقاذ', issuer: 'الهلال الأحمر الأمريكي', description: 'شهادة حالية في الإسعافات الأولية الطارئة والإنعاش القلبي الرئوي.' },
    ],
    achievements: [
      { label: 'شهادات', value: '+6' },
      { label: 'ورش عمل', value: '+20' },
      { label: 'تعليم مستمر', value: '+100 ساعة' },
      { label: 'سنوات معتمد', value: '+10' },
      { label: 'تخصصات', value: '4' },
      { label: 'نجاح العملاء', value: '98%' },
    ],
    bannerHeading: 'ملتزم بالتميز',
    bannerText: 'أستثمر في التعليم المستمر لأقدم لك أحدث وأكثر طرق التدريب والتغذية فعالية. نجاحك هو أولويتي.',
    certifiedSince: 'معتمد منذ',
  },
  testimonials: {
    sectionTitle: 'قصص نجاح العملاء',
    sectionSubtitle: 'آراء العملاء',
    description: 'أشخاص حقيقيون. نتائج حقيقية. استمع من عملاء حوّلوا حياتهم مع كوتش كونان.',
    items: [
      { name: 'أحمد م.', role: 'خسر 20 كجم في 4 شهور', text: 'كوتش كونان لا يدرب جسمك فقط — بل يحوّل عقلك. النهج الشخصي صنع كل الفرق. حافظت على وزني لأكثر من سنة!' },
      { name: 'سارة ك.', role: 'اكتسبت 6 كجم عضلات في 3 شهور', text: 'كامرأة، كنت خائفة من زيادة الحجم. كوتش كونان صمم برنامجاً ساعدني على بناء عضلات نقية مع الحفاظ على الأنوثة. أفضل قرار اتخذته!' },
      { name: 'عمر ح.', role: 'تحضير مسابقات — المركز الأول', text: 'برنامج تحضير المسابقات كان مذهلاً. الاهتمام بالتفاصيل في التدريب والتغذية ساعدني على الفوز بأول عرض كمال أجسام!' },
      { name: 'ليلى أ.', role: 'تحول بعد الحمل', text: 'العودة للشكل بعد الحمل بدت مستحيلة حتى بدأت التدريب مع كوتش كونان. كان صبوراً وداعماً والنتائج تتحدث عن نفسها.' },
      { name: 'يوسف ر.', role: 'تحسين الأداء الرياضي', text: 'سرعتي وقوتي وتحملي تحسنوا بشكل كبير. برنامج التدريب المتخصص أعطاني ميزة حقيقية في الملعب.' },
      { name: 'نور ع.', role: 'خسرت 15 كجم بالتدريب أونلاين', text: 'رغم أنني في مدينة مختلفة، التدريب أونلاين كان فعالاً بنفس القدر. البوابة سهلت متابعة برامجي وتتبع تقدمي.' },
    ],
    leaveComment: 'اترك تعليقاً',
    commentPlaceholder: 'شارك تجربتك مع كوتش كونان...',
    yourName: 'اسمك',
    submitComment: 'إرسال التعليق',
    submitting: 'جاري الإرسال...',
    commentSuccess: 'شكراً لك! سيظهر تعليقك بعد المراجعة.',
    commentsSection: 'تعليقات الزوار',
    cancel: 'إلغاء',
    rating: 'التقييم',
    yourComment: 'تعليقك',
    beFirstComment: 'كن أول من يترك تعليقاً!',
  },
  faq: {
    sectionTitle: 'أسئلة شائعة',
    sectionSubtitle: 'الأسئلة المتكررة',
    description: 'لديك أسئلة؟ لدينا إجابات. اعرف كل ما تحتاج عن التدريب مع كوتش كونان.',
    items: [
      { question: 'كيف أبدأ مع كوتش كونان؟', answer: 'ببساطة املأ نموذج التواصل أو أرسل رسالة واتساب. سنحدد استشارة مجانية لمناقشة أهدافك وإنشاء خطة شخصية.' },
      { question: 'ماذا تتضمن باقات التدريب؟', answer: 'جميع الباقات تشمل برامج تمارين شخصية وإرشاد تغذية وتتبع التقدم وتواصل مباشر مع كوتش كونان. المستويات الأعلى تتضمن المزيد من الجلسات وميزات إضافية.' },
      { question: 'هل يمكنني التدريب أونلاين إذا كنت خارج القاهرة؟', answer: 'بالتأكيد! برنامج التدريب أونلاين مصمم للعملاء في أي مكان. ستحصل على نفس جودة التدريب عبر مكالمات الفيديو وبوابة العملاء ودعم الواتساب.' },
      { question: 'كم الوقت قبل أن أرى نتائج؟', answer: 'معظم العملاء يبدأون برؤية نتائج ملموسة خلال 4-6 أسابيع. التحولات الكبيرة تستغرق عادة 12 أسبوعاً، حسب نقطة البداية ومستوى الالتزام.' },
      { question: 'هل أحتاج خبرة في الجيم للبدء؟', answer: 'لا على الإطلاق! برامجنا مصممة لجميع مستويات اللياقة، من المبتدئين تماماً إلى الرياضيين المتقدمين. سنلتقي بك أينما كنت ونبني من هناك.' },
      { question: 'ما الذي يميز كوتش كونان عن المدربين الآخرين؟', answer: 'مزيجنا من التدريب العلمي والتغذية الشخصية والدعم المستمر وسجل حافل بـ 500+ تحول يميزنا. نحن ملتزمون بنجاحك طويل الأمد، وليس الحلول السريعة.' },
    ],
    stillQuestions: 'لا تزال لديك أسئلة؟',
    contactCoach: 'تواصل مع كوتش كونان',
  },
  portalCta: {
    sectionTitle: 'العملاء',
    sectionSubtitle: 'دخول العملاء',
    description: 'تجربة تدريب شخصية، متاحة في أي وقت. تتبع التمارين واتبع خطط التغذية وراقب تقدمك.',
    features: [
      { label: 'التمارين', desc: 'برامج مخصصة' },
      { label: 'التغذية', desc: 'خطط الوجبات' },
      { label: 'التقدم', desc: 'تتبع النتائج' },
      { label: 'الجلسات', desc: 'حجز المواعيد' },
    ],
    loginButton: 'دخول العملاء',
    portalHeader: 'بوابة العملاء',
    todayWorkout: 'تمرين اليوم',
    active: 'نشط',
    nutritionPlan: 'خطة التغذية',
    progress: 'التقدم',
    nextSession: 'الجلسة القادمة',
    portalName: 'العملاء',
    mockWorkoutDesc: 'تمارين الجزء العلوي — ٦ تمارين',
    mockCalories: '١,٨٥٠ سعرة',
    mockProtein: 'بروتين',
    mockCarbs: 'كربوهيدرات',
    mockFats: 'دهون',
    mockWeightLoss: '▼ ٢.٥ كجم هذا الأسبوع',
    mockTomorrow: 'غداً، ١٠ صباحاً',
  },
  dashboard: {
    dashboard: 'لوحة التحكم',
    clients: 'العملاء',
    clientData: 'بيانات العملاء',
    workouts: 'التمارين',
    nutrition: 'التغذية',
    progress: 'التقدم',
    sessions: 'الجلسات',
    payments: 'المدفوعات',
    settings: 'الإعدادات',
    signOut: 'تسجيل الخروج',
    backToWebsite: 'العودة للموقع',
    totalClients: 'إجمالي العملاء',
    activeClients: 'العملاء النشطون',
    sessionsThisWeek: 'جلسات هذا الأسبوع',
    revenueThisMonth: 'الإيرادات هذا الشهر',
    revenueOverview: 'نظرة عامة على الإيرادات',
    totalRevenue: 'إجمالي الإيرادات',
    pendingPayments: 'مدفوعات معلقة',
    overdue: 'متأخرة',
    vsLastMonth: 'مقارنة بالشهر الماضي',
    quickActions: 'إجراءات سريعة',
    addClient: 'إضافة عميل',
    registerNewClient: 'تسجيل عميل جديد',
    createWorkout: 'إنشاء تمرين',
    designWorkoutPlan: 'تصميم خطة تمرين',
    scheduleSession: 'حجز جلسة',
    bookTrainingSession: 'حجز جلسة تدريب',
    upcomingSessions: 'الجلسات القادمة',
    noUpcomingSessions: 'لا توجد جلسات قادمة',
    scheduledSessionsWillAppear: 'ستظهر الجلسات المجدولة هنا',
    viewAll: 'عرض الكل',
    recentActivity: 'النشاط الأخير',
    noRecentActivity: 'لا يوجد نشاط أخير',
    activityLogsWillAppear: 'ستظهر سجلات النشاط هنا',
    clientPortal: 'بوابة العملاء',
    website: 'الموقع',
    thisMonth: 'هذا الشهر',
    lastMonth: 'الشهر الماضي',
    justNow: 'الآن',
    minutesAgo: 'د',
    hoursAgo: 'س',
    daysAgo: 'ي',
    clientFallback: 'عميل',
    trainingFallback: 'تدريب',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    close: 'إغلاق',
    done: 'تم',
    update: 'تحديث',
    saving: 'جاري الحفظ...',
    create: 'إنشاء',
    allClients: 'جميع العملاء',
    selectClient: 'اختر عميلاً',
    filterByClient: 'تصفية حسب العميل',
    male: 'ذكر',
    female: 'أنثى',
    active: 'نشط',
    inactive: 'غير نشط',
    approved: 'موافق عليه',
    rejected: 'مرفوض',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    scheduled: 'مجدول',
    paid: 'مدفوع',
    draft: 'مسودة',
    tryAgain: 'حاول مرة أخرى',
    unknown: 'غير معروف',
    revenue: 'الإيرادات',
    manageClients: 'إدارة عملاء التدريب',
    allClientsTab: 'جميع العملاء',
    pendingApprovalTab: 'بانتظار الموافقة',
    noClientsFound: 'لم يتم العثور على عملاء',
    addFirstClient: 'أضف أول عميل للبدء',
    noPendingApprovals: 'لا توجد موافقات معلقة',
    allRegistrationsReviewed: 'تم مراجعة جميع تسجيلات العملاء',
    searchClients: 'ابحث بالاسم أو البريد أو الهاتف...',
    clientApproved: 'تمت الموافقة على العميل بنجاح',
    clientRejected: 'تم رفض العميل',
    approveFailed: 'فشل في الموافقة على العميل',
    rejectFailed: 'فشل في رفض العميل',
    clientUpdated: 'تم تحديث العميل بنجاح',
    clientCreated: 'تم إنشاء العميل بنجاح',
    clientDeactivated: 'تم حذف العميل من النظام',
    deactivateFailed: 'فشل في حذف العميل',
    saveClientFailed: 'فشل في حفظ العميل',
    nameEmailRequired: 'الاسم والبريد الإلكتروني مطلوبان',
    editClientTitle: 'تعديل العميل',
    addNewClientTitle: 'إضافة عميل جديد',
    updateClientInfo: 'تحديث معلومات العميل',
    registerNewClientDesc: 'تسجيل عميل تدريب جديد',
    fullNamePlaceholder: 'الاسم الكامل',
    emailPlaceholderDash: 'email@example.com',
    phonePlaceholderDash: '+20 xxx xxx xxxx',
    agePlaceholderDash: 'العمر',
    selectOption: 'اختر',
    goalPlaceholderDash: 'مثال: خسارة وزن، زيادة عضلات',
    createWithPortalAccess: 'إنشاء مع وصول البوابة',
    autoGenCredentials: 'إنشاء بيانات دخول تلقائية لبوابة العملاء',
    securePasswordNote: 'سيتم إنشاء كلمة مرور آمنة تلقائياً. سيتم الموافقة المسبقة على العميل ويمكنه تسجيل الدخول فوراً باستخدام بيانات الدخول المقدمة بعد الإنشاء.',
    createGenerateCreds: 'إنشاء وإنشاء بيانات الدخول',
    clientPortalCredentials: 'بيانات دخول بوابة العملاء',
    shareCredentials: 'شارك بيانات الدخول هذه مع العميل ليتمكن من تسجيل الدخول',
    emailUpper: 'البريد الإلكتروني',
    passwordUpper: 'كلمة المرور',
    shareSecurely: 'تأكد من مشاركة بيانات الدخول بأمان مع العميل. لن تظهر كلمة المرور مرة أخرى بعد إغلاق هذا الحوار.',
    passwordNotShownAgain: 'لن تظهر كلمة المرور مرة أخرى بعد إغلاق هذا الحوار.',
    copyCredentials: 'نسخ بيانات الدخول',
    copiedToClipboard: 'تم نسخ بيانات الدخول',
    copyFailed: 'فشل النسخ. يرجى النسخ يدوياً.',
    deleteClientTitle: 'حذف العميل',
    deactivateClientConfirm: 'هل أنت متأكد من حذف هذا العميل نهائياً؟ سيتم حذفه وجميع بياناته من النظام. لا يمكن التراجع عن هذا الإجراء.',
    clientSince: 'عميل منذ',
    ageYears: 'سنوات',
    weightKg: 'الوزن (كجم)',
    heightCm: 'الطول (سم)',
    statusLabel: 'الحالة',
    approvalLabel: 'الموافقة',
    noWorkoutPlansYet: 'لا توجد خطط تمارين بعد',
    noNutritionPlansYet: 'لا توجد خطط تغذية بعد',
    noProgressEntriesYet: 'لا توجد إدخالات تقدم بعد',
    noSessionsFoundDetail: 'لم يتم العثور على جلسات',
    noFrequencySet: 'لم يتم تحديد التكرار',
    noCaloriesSet: 'لم يتم تحديد السعرات',
    pendingApprovalLabel: 'بانتظار الموافقة',
    rejectedLabel: 'مرفوض',
    approvedLabel: 'موافق عليه',
    approveBtn: 'موافقة',
    rejectBtn: 'رفض',
    profileImage: 'صورة الملف الشخصي',
    uploadImage: 'رفع صورة',
    uploading: 'جارٍ الرفع...',
    maxSize2MB: 'حد أقصى ٥ ميجا، JPG/PNG (ضغط تلقائي)',
    remove: 'إزالة',
    notesLabel: 'ملاحظات',
    phoneOrEmailRequired: 'رقم الهاتف أو البريد الإلكتروني مطلوب',
    forPortalAccess: 'لتسجيل الدخول لبوابة العميل',
    workoutPrograms: 'برامج التمارين',
    manageWorkouts: 'إنشاء وإدارة برامج التمارين',
    createProgram: 'إنشاء برنامج',
    searchWorkouts: 'ابحث في التمارين...',
    noWorkoutPrograms: 'لم يتم العثور على برامج تمارين',
    createFirstProgram: 'أنشئ برنامجك الأول',
    editWorkoutTitle: 'تعديل برنامج التمارين',
    createWorkoutTitle: 'إنشاء برنامج تمارين',
    updateWorkoutDesc: 'تحديث تفاصيل وهيكل برنامج التمارين',
    designWorkoutDesc: 'تصميم برنامج تمارين جديد باستخدام أداة البناء المرئي',
    basicInfo: 'معلومات أساسية',
    planNameLabel: 'اسم الخطة',
    clientRequired: 'العميل',
    frequencyLabel: 'التكرار',
    durationWeeks: 'المدة (أسابيع)',
    descriptionLabel: 'الوصف',
    programBuilder: 'منشئ البرنامج',
    addWeek: 'إضافة أسبوع',
    noWeeksAdded: 'لم تتم إضافة أسابيع بعد',
    addFirstWeek: 'أضف أول أسبوع',
    weekNameOptional: 'اسم الأسبوع (اختياري)',
    restLabel: 'راحة',
    exerciseName: 'اسم التمرين',
    muscleGroup: 'مجموعة العضلات',
    sets: 'المجموعات',
    reps: 'التكرارات',
    weightKgField: 'الوزن (كجم)',
    restSeconds: 'الراحة (ث)',
    tempo: 'الإيقاع',
    addExercise: 'إضافة تمرين',
    addDay: 'إضافة يوم',
    duplicateBtn: 'تكرار',
    deleteWorkoutTitle: 'حذف برنامج التمارين',
    deleteWorkoutConfirm: 'هل أنت متأكد من حذف برنامج التمارين هذا؟ لا يمكن التراجع عن هذا الإجراء.',
    nameClientRequired: 'الاسم والعميل مطلوبان',
    saveWorkoutFailed: 'فشل في حفظ برنامج التمارين',
    weekLabel: 'الأسبوع',
    restAndRecovery: 'راحة واستشفاء',
    noExercisesDefined: 'لم يتم تحديد تمارين',
    noDaysDefined: 'لم يتم تحديد أيام لهذا الأسبوع',
    noWeeksDefined: 'لم يتم تحديد أسابيع لهذا البرنامج',
    nutritionPlans: 'خطط التغذية',
    manageNutrition: 'إنشاء وإدارة برامج التغذية',
    createPlan: 'إنشاء خطة',
    searchPlans: 'ابحث في الخطط...',
    noNutritionPlans: 'لم يتم العثور على خطط تغذية',
    createFirstNutritionPlan: 'أنشئ أول خطة تغذية للبدء',
    editNutritionTitle: 'تعديل خطة التغذية',
    createNutritionTitle: 'إنشاء خطة تغذية',
    updateNutritionDesc: 'تحديث برنامج التغذية',
    designNutritionDesc: 'تصميم برنامج تغذية لعميلك',
    planNameLabel: 'اسم الخطة',
    descriptionOptional: 'الوصف',
    dailyMacros: 'الماكرو اليومي',
    caloriesKcal: 'السعرات (كيلو كالوري)',
    proteinG: 'البروتين (جم)',
    carbsG: 'الكربوهيدرات (جم)',
    fatsG: 'الدهون (جم)',
    fiberG: 'الألياف (جم)',
    fiberOptional: 'الألياف (جم) — اختياري',
    waterMl: 'الماء (مل)',
    autoCalculated: 'محسوب تلقائياً من الأطعمة:',
    autoCalcFromFood: 'حساب تلقائي من الأطعمة',
    foodNameLabel: 'اسم الطعام',
    dateRangeOptional: 'نطاق التاريخ (اختياري)',
    startDate: 'تاريخ البدء',
    endDate: 'تاريخ الانتهاء',
    mealsBuilder: 'منشئ الوجبات',
    addMeal: 'إضافة وجبة',
    mealType: 'نوع الوجبة',
    mealName: 'اسم الوجبة',
    timeLabel: 'الوقت',
    foodItems: 'الأطعمة',
    addFoodItem: 'إضافة طعام',
    quantityLabel: 'الكمية',
    unitLabel: 'الوحدة',
    caloriesLabel: 'السعرات',
    untitledMeal: 'وجبة بدون اسم',
    itemLabel: 'عنصر',
    itemsLabel: 'عناصر',
    macroSummary: 'ملخص الماكرو',
    dailyWaterTarget: 'هدف الماء اليومي',
    planDuration: 'مدة الخطة',
    mealsLabel: 'الوجبات',
    noMealsDefined: 'لم يتم تحديد وجبات لهذه الخطة',
    noFoodItemsAdded: 'لم تتم إضافة أطعمة',
    deleteNutritionTitle: 'حذف خطة التغذية',
    deleteNutritionConfirm: 'هل أنت متأكد من حذف خطة التغذية هذه؟ لا يمكن التراجع عن هذا الإجراء.',
    nameClientRequiredNutrition: 'الاسم والعميل مطلوبان',
    saveNutritionFailed: 'فشل في حفظ خطة التغذية',
    breakfast: 'فطور',
    snack: 'وجبة خفيفة',
    lunch: 'غداء',
    dinner: 'عشاء',
    preWorkout: 'قبل التمرين',
    postWorkout: 'بعد التمرين',
    custom: 'مخصص',
    progressTracker: 'متتبع التقدم',
    trackProgress: 'تتبع قياسات وتقدم العملاء',
    addEntry: 'إضافة إدخال',
    selectClientLabel: 'اختر العميل:',
    chooseClient: 'اختر عميلاً...',
    selectClientTitle: 'اختر عميلاً',
    chooseClientProgress: 'اختر عميلاً لعرض سجل تقدمه',
    weightProgress: 'تقدم الوزن',
    weightKgChart: 'الوزن (كجم)',
    progressHistory: 'سجل التقدم',
    noProgressEntries: 'لا توجد إدخالات تقدم بعد',
    addFirstEntry: 'أضف أول إدخال لبدء التتبع',
    weightLabel: 'الوزن',
    bodyFatLabel: 'دهون الجسم',
    muscleLabel: 'العضلات',
    waistLabel: 'الخصر',
    chestLabel: 'الصدر',
    armsLabel: 'الذراعين',
    thighsLabel: 'الفخذين',
    addProgressTitle: 'إضافة إدخال تقدم',
    recordMeasurementsFor: 'تسجيل قياسات جديدة لـ',
    weightKgField: 'الوزن (كجم)',
    bodyFatPercent: 'دهون الجسم (%)',
    muscleMassKg: 'الكتلة العضلية (كجم)',
    waistCm: 'الخصر (سم)',
    chestCm: 'الصدر (سم)',
    armsCm: 'الذراعين (سم)',
    thighsCm: 'الفخذين (سم)',
    additionalNotes: 'ملاحظات إضافية...',
    deleteEntryTitle: 'حذف الإدخال',
    deleteEntryConfirm: 'هل أنت متأكد من حذف إدخال التقدم هذا؟',
    selectClientFirst: 'يرجى اختيار عميل أولاً',
    saveProgressFailed: 'فشل في إضافة إدخال التقدم',
    sessionsTitle: 'الجلسات',
    manageSessions: 'إدارة جلسات التدريب والجدولة',
    scheduleSessionBtn: 'حجز جلسة',
    searchSessions: 'ابحث في الجلسات...',
    upcomingSessionsTitle: 'الجلسات القادمة',
    noSessionsTitle: 'لا توجد جلسات',
    scheduleFirstSession: 'احجز أول جلسة تدريب',
    editSessionTitle: 'تعديل الجلسة',
    scheduleSessionTitle: 'حجز جلسة',
    updateSessionDesc: 'تحديث تفاصيل الجلسة',
    bookSessionDesc: 'حجز جلسة تدريب جديدة',
    clientRequiredSession: 'العميل',
    dateTimeRequired: 'التاريخ والوقت',
    durationMin: 'المدة (دقيقة)',
    typeLabel: 'النوع',
    selectType: 'اختر النوع',
    sessionNotes: 'ملاحظات الجلسة...',
    scheduleBtn: 'حجز',
    deleteSessionTitle: 'حذف الجلسة',
    deleteSessionConfirm: 'هل أنت متأكد من حذف هذه الجلسة؟',
    clientDateRequired: 'العميل والتاريخ مطلوبان',
    saveSessionFailed: 'فشل في حفظ الجلسة',
    personalTrainingSession: 'تدريب شخصي',
    onlineCoachingSession: 'تدريب أونلاين',
    groupTraining: 'تدريب جماعي',
    assessment: 'تقييم',
    consultation: 'استشارة',
    followUp: 'متابعة',
    scheduledLabel: 'مجدول',
    completedLabel: 'مكتمل',
    cancelledLabel: 'ملغي',
    allStatus: 'جميع الحالات',
    paymentsTitle: 'المدفوعات',
    trackPayments: 'تتبع المدفوعات والفواتير والإيرادات',
    recordPaymentBtn: 'تسجيل دفعة',
    totalRevenueLabel: 'إجمالي الإيرادات',
    thisMonthLabel: 'هذا الشهر',
    pendingLabel: 'معلق',
    overdueLabel: 'متأخرة',
    searchPayments: 'ابحث بالعميل أو الوصف أو الفاتورة...',
    paidLabel: 'مدفوع',
    noPayments: 'لا توجد مدفوعات',
    recordFirstPayment: 'سجل أول دفعة للبدء',
    markPaid: 'تعليم كمدفوع',
    dueLabel: 'الاستحقاق',
    paidLabelDate: 'مدفوع',
    editPaymentTitle: 'تعديل الدفعة',
    recordPaymentTitle: 'تسجيل دفعة',
    updatePaymentDesc: 'تحديث تفاصيل الدفعة',
    recordNewPayment: 'تسجيل دفعة جديدة',
    clientRequiredPayment: 'العميل',
    amountRequired: 'المبلغ',
    amountLabel: 'المبلغ',
    currencyLabel: 'العملة',
    dueDateLabel: 'تاريخ الاستحقاق',
    paymentMethodLabel: 'طريقة الدفع',
    selectMethod: 'اختر الطريقة',
    deletePaymentTitle: 'حذف الدفعة',
    deletePaymentConfirm: 'هل أنت متأكد من حذف هذه الدفعة؟ لا يمكن التراجع عن هذا الإجراء.',
    clientAmountRequired: 'العميل والمبلغ مطلوبان',
    validAmountRequired: 'يرجى إدخال مبلغ صحيح',
    savePaymentFailed: 'فشل في حفظ الدفعة',
    cash: 'نقدي',
    bankTransfer: 'تحويل بنكي',
    creditCard: 'بطاقة ائتمان',
    debitCard: 'بطاقة خصم',
    mobilePayment: 'دفع عبر الهاتف',
    onlineTransfer: 'تحويل إلكتروني',
    checkPayment: 'شيك',
    otherPayment: 'أخرى',
    settingsTitle: 'الإعدادات',
    manageProfileSecurity: 'إدارة الملف الشخصي وتفضيلات الأمان',
    profileTab: 'الملف الشخصي',
    securityTab: 'الأمان',
    editProfile: 'تعديل الملف الشخصي',
    fullName: 'الاسم الكامل',
    profileImageUrl: 'رابط صورة الملف الشخصي',
    enterFullName: 'أدخل اسمك الكامل',
    profileImagePlaceholder: 'https://example.com/avatar.jpg',
    pasteUrlNote: 'الصق رابطاً لصورة ملفك الشخصي. اتركه فارغاً لاستخدام الأحرف الأولى.',
    imagePreview: 'معاينة الصورة',
    saveChanges: 'حفظ التغييرات',
    savingChanges: 'جاري الحفظ...',
    changePassword: 'تغيير كلمة المرور',
    currentPassword: 'كلمة المرور الحالية',
    newPasswordLabel: 'كلمة المرور الجديدة',
    confirmNewPassword: 'تأكيد كلمة المرور الجديدة',
    enterCurrentPassword: 'أدخل كلمة المرور الحالية',
    enterNewPassword: 'أدخل كلمة المرور الجديدة',
    confirmNewPasswordPlaceholder: 'أكد كلمة المرور الجديدة',
    hidePassword: 'إخفاء كلمة المرور',
    showPassword: 'إظهار كلمة المرور',
    passwordsDoNotMatch: 'كلمات المرور غير متطابقة',
    passwordsMatchLabel: 'كلمات المرور متطابقة',
    passwordRequirementsLabel: 'متطلبات كلمة المرور',
    allRequirementsMet: 'تم استيفاء جميع المتطلبات',
    accountLockoutPolicy: 'سياسة قفل الحساب',
    lockoutPolicyDesc: 'بعد 5 محاولات تسجيل دخول فاشلة، سيتم قفل حسابك لمدة 15 دقيقة لأسباب أمنية. إذا تم قفلك، انتظر فترة التهدئة قبل المحاولة مرة أخرى.',
    dangerZone: 'منطقة الخطر',
    irreversibleActions: 'إجراءات لا رجعة فيها تؤثر على وصولك للحساب',
    signOutAllDevices: 'تسجيل الخروج من جميع الأجهزة',
    nameRequired: 'الاسم مطلوب',
    nameMinLength: 'يجب أن يكون الاسم حرفين على الأقل',
    invalidUrl: 'يجب أن يكون رابطاً صحيحاً يبدأ بـ http(s)://',
    profileUpdated: 'تم تحديث الملف الشخصي بنجاح',
    profileUpdateFailed: 'فشل في تحديث الملف الشخصي',
    currentPasswordRequired: 'كلمة المرور الحالية مطلوبة',
    passwordNotMeetReqs: 'كلمة المرور لا تستوفي جميع المتطلبات',
    newPasswordsNoMatch: 'كلمات المرور الجديدة غير متطابقة',
    passwordChanged: 'تم تغيير كلمة المرور بنجاح',
    passwordChangeFailed: 'فشل في تغيير كلمة المرور',
    signedOutAllDevices: 'تم تسجيل الخروج من جميع الأجهزة',
    atLeast8Chars: '8 أحرف على الأقل',
    oneUppercase: 'حرف كبير واحد',
    oneLowercase: 'حرف صغير واحد',
    oneNumber: 'رقم واحد',
    oneSpecialChar: 'رمز خاص واحد',
    emailInfoLabel: 'البريد الإلكتروني',
    memberSince: 'عضو منذ',
    lastLogin: 'آخر تسجيل دخول',
    notAvailable: 'غير متوفر',
    clientSpreadsheet: 'جدول بيانات العملاء',
    fullClientDetails: 'تفاصيل العملاء الكاملة في عرض جدول البيانات',
    exportCSVLabel: 'تصدير CSV',
    totalClientsLabel: 'إجمالي العملاء',
    activeClientsLabel: 'العملاء النشطون',
    pendingApprovalLabel: 'بانتظار الموافقة',
    avgWeightKg: 'متوسط الوزن (كجم)',
    searchByNameEmailPhone: 'ابحث بالاسم أو البريد أو الهاتف...',
    statusFilter: 'الحالة',
    approvalFilter: 'الموافقة',
    allApproval: 'جميع الموافقات',
    showingOfClients: 'عملاء',
    numberHeader: '#',
    fullNameHeader: 'الاسم الكامل',
    emailHeader: 'البريد الإلكتروني',
    phoneHeader: 'الهاتف',
    ageHeader: 'العمر',
    genderHeader: 'الجنس',
    weightKgHeader: 'الوزن (كجم)',
    heightCmHeader: 'الطول (سم)',
    goalHeader: 'الهدف',
    statusHeader: 'الحالة',
    approvalHeader: 'الموافقة',
    startDateHeader: 'تاريخ البدء',
    registeredHeader: 'تاريخ التسجيل',
    noClientsFoundTable: 'لم يتم العثور على عملاء',
    adjustSearchFilter: 'عدّل معايير البحث أو التصفية',
    failedToLoadClients: 'فشل في تحميل العملاء',
    tryAgainBtn: 'حاول مرة أخرى',
    csvExported: 'تم تصدير CSV بنجاح',
    failedToLoadClientsError: 'فشل في تحميل العملاء',
  },
  contact: {
    sectionTitle: 'اتصل بي',
    sectionSubtitle: 'اتصل بي',
    description: 'مستعد لبدء تحولك؟ تواصل معي ودعنا نناقش كيف يمكنني مساعدتك في تحقيق أهداف اللياقة.',
    location: 'الموقع',
    locationDetail: 'القاهرة، مصر',
    phone: 'الهاتف',
    phoneDetail: 'متاح يومياً 8 ص - 10 م',
    email: 'البريد الإلكتروني',
    emailDetail: 'الرد خلال 24 ساعة',
    workingHours: 'ساعات العمل',
    workingHoursDetail: 'السبت - الخميس: 8 ص - 10 م',
    connectWithMe: 'تواصل معي',
    instagram: 'إنستجرام',
    whatsapp: 'واتساب',
    facebook: 'فيسبوك',
    direct: 'مباشر',
    follow: 'تابع',
    formHeading: 'أرسل رسالة',
    formDescription: 'املأ النموذج أدناه وسيتواصل معك كوتش كونان خلال 24 ساعة.',
    successHeading: 'تم إرسال الرسالة!',
    successText: 'كوتش كونان سيتواصل معك قريباً.',
    fullName: 'الاسم الكامل',
    fullNamePlaceholder: 'اسمك',
    emailLabel: 'البريد الإلكتروني',
    emailPlaceholder: 'your@email.com',
    phoneLabel: 'الهاتف',
    phonePlaceholder: '+20 xxx xxx xxxx',
    interestedIn: 'مهتم بـ',
    selectService: 'اختر خدمة',
    personalTraining: 'تدريب شخصي',
    onlineCoaching: 'تدريب أونلاين',
    nutritionPlanning: 'تخطيط التغذية',
    bodyTransformation: 'تحويل الجسم',
    message: 'الرسالة',
    messagePlaceholder: 'أخبرني عن أهدافك في اللياقة...',
    sending: 'جاري الإرسال...',
    sendMessage: 'إرسال الرسالة',
    somethingWentWrong: 'حدث خطأ ما',
    failedToSend: 'فشل في إرسال الرسالة',
  },
  footer: {
    brandDescription: 'أفضل مدرب شخصي في القاهرة. تحويل الحيات عبر التدريب المكرس والبرامج الشخصية والدعم المستمر.',
    quickLinks: 'روابط سريعة',
    services: 'الخدمات',
    getInTouch: 'تواصل معنا',
    chatWhatsApp: 'تواصل واتساب',
    copyright: 'كوتش كونان. جميع الحقوق محفوظة.',
    madeWith: 'صنع بـ ❤ في القاهرة، مصر',
    home: 'الرئيسية',
    about: 'عني',
    servicesNav: 'الخدمات',
    achievements: 'الإنجازات',
    testimonials: 'آراء العملاء',
    contact: 'تواصل',
  },
  coachLogin: {
    title: 'لوحة المدرب',
    subtitle: 'سجل دخول لإدارة عملك التدريبي',
    email: 'البريد الإلكتروني',
    emailPlaceholder: 'coach@example.com',
    password: 'كلمة المرور',
    passwordPlaceholder: '••••••••',
    signIn: 'تسجيل الدخول',
    backToWebsite: 'العودة للموقع',
    loginFailed: 'فشل تسجيل الدخول',
  },
  clientLogin: {
    signIn: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    email: 'البريد الإلكتروني',
    emailPlaceholder: 'your@email.com',
    password: 'كلمة المرور',
    passwordPlaceholder: '••••••••',
    fullName: 'الاسم الكامل',
    fullNamePlaceholder: 'اسمك الكامل',
    confirmPassword: 'تأكيد كلمة المرور',
    confirmPlaceholder: 'تأكيد',
    phone: 'الهاتف',
    phonePlaceholder: '+20 xxx xxx xxxx',
    age: 'العمر',
    agePlaceholder: 'العمر',
    gender: 'الجنس',
    genderPlaceholder: 'اختر',
    weight: 'الوزن (كجم)',
    weightPlaceholder: 'كجم',
    height: 'الطول (سم)',
    heightPlaceholder: 'سم',
    goal: 'الهدف',
    goalPlaceholder: 'اختر هدفك',
    createAccount: 'إنشاء حساب',
    fixErrors: 'يرجى تصحيح الأخطاء أعلاه',
    passwordMatch: 'كلمات المرور متطابقة',
    passwordNoMatch: 'كلمات المرور غير متطابقة',
    passwordRequirements: 'متطلبات كلمة المرور:',
    minChars: '8 أحرف على الأقل',
    uppercase: 'حرف كبير واحد (A-Z)',
    lowercase: 'حرف صغير واحد (a-z)',
    number: 'رقم واحد (0-9)',
    specialChar: 'رمز خاص واحد (!@#$...)',
    pendingApproval: 'تسجيلك في انتظار موافقة المدرب. يرجى المراجعة لاحقاً.',
    accountRejected: 'تم رفض حسابك. يرجى التواصل مع مدربك لمزيد من المعلومات.',
    registrationSuccess: 'تم التسجيل بنجاح! حسابك في انتظار موافقة المدرب. ستتمكن من تسجيل الدخول بعد الموافقة.',
    loginFailed: 'فشل تسجيل الدخول',
    nameRequired: 'الاسم الكامل مطلوب',
    nameMinLength: 'يجب أن يكون الاسم حرفين على الأقل',
    emailRequired: 'البريد الإلكتروني مطلوب',
    emailInvalid: 'يرجى إدخال بريد إلكتروني صحيح',
    passwordRequired: 'كلمة المرور مطلوبة',
    passwordMinLength: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
    passwordUppercase: 'يجب أن تحتوي على حرف كبير',
    passwordLowercase: 'يجب أن تحتوي على حرف صغير',
    passwordNumber: 'يجب أن تحتوي على رقم',
    passwordSpecial: 'يجب أن تحتوي على رمز خاص',
    confirmRequired: 'يرجى تأكيد كلمة المرور',
    confirmNoMatch: 'كلمات المرور غير متطابقة',
    ageInvalid: 'يجب أن يكون العمر رقماً صحيحاً',
    weightInvalid: 'يجب أن يكون الوزن رقماً',
    heightInvalid: 'يجب أن يكون الطول رقماً',
    male: 'ذكر',
    female: 'أنثى',
    other: 'آخر',
    weightLoss: 'خسارة الوزن',
    muscleGain: 'زيادة العضلات',
    bodyRecomposition: 'إعادة تشكيل الجسم',
    strength: 'القوة',
    endurance: 'التحمل',
    flexibility: 'المرونة',
    generalFitness: 'لياقة عامة',
    sportsPerformance: 'الأداء الرياضي',
  },
  clientDash: {
    welcomeBack: 'مرحباً بعودتك',
    trainingOverview: 'إليك نظرة عامة على تدريبك',
    weight: 'الوزن (كجم)',
    goalLabel: 'الهدف',
    activeProgram: 'البرنامج النشط',
    nextSession: 'الجلسة القادمة',
    none: 'لا يوجد',
    latestMeasurements: 'آخر القياسات',
    recordedOn: 'سُجل في',
    bodyFat: 'نسبة الدهون',
    muscleMass: 'الكتلة العضلية',
    waist: 'الخصر',
    overview: 'نظرة عامة',
    workouts: 'التمارين',
    nutrition: 'التغذية',
    progress: 'التقدم',
    sessions: 'الجلسات',
    payments: 'المدفوعات',
    workoutPrograms: 'برامج التمارين',
    assignedPrograms: 'برامجك التدريبية المخصصة',
    noWorkouts: 'لا توجد تمارين مخصصة',
    noWorkoutsDesc: 'سيخصص مدربك برامج تمارين هنا',
    week: 'أسبوع',
    day: 'يوم',
    days: 'أيام',
    restDay: 'يوم راحة',
    restRecovery: 'راحة واستعادة',
    noExercises: 'لا توجد تمارين محددة',
    noProgramDetails: 'لا توجد تفاصيل للبرنامج',
    nutritionPlans: 'خطط التغذية',
    assignedPlans: 'برامجك الغذائية المخصصة',
    noNutrition: 'لا توجد خطط تغذية',
    noNutritionDesc: 'سيخصص مدربك خطط تغذية هنا',
    dailyMacros: 'الماكرو اليومي',
    calories: 'السعرات (كيلو كالوري)',
    protein: 'البروتين',
    carbs: 'الكربوهيدرات',
    fats: 'الدهون',
    meals: 'الوجبات',
    meal: 'وجبة',
    dailyWater: 'هدف الماء اليومي',
    planDuration: 'مدة الخطة',
    noMeals: 'لا توجد وجبات محددة لهذه الخطة',
    noFoodItems: 'لم تتم إضافة عناصر غذائية',
    progressTracking: 'تتبع التقدم',
    trackMeasurements: 'تتبع قياساتك بمرور الوقت',
    addProgress: 'إضافة قياس',
    weightProgress: 'تقدم الوزن',
    progressHistory: 'سجل التقدم',
    noProgress: 'لا توجد قياسات بعد',
    noProgressDesc: 'أضف أول قياس لبدء التتبع',
    addEntry: 'إضافة قياس',
    recordMeasurements: 'سجل قياساتك',
    chest: 'الصدر',
    arms: 'الذراعين',
    thighs: 'الفخذين',
    hips: 'الأوراك',
    notes: 'ملاحظات',
    notesPlaceholder: 'أي ملاحظات...',
    sessionsTab: 'الجلسات',
    noSessions: 'لا توجد جلسات مجدولة',
    scheduled: 'مجدولة',
    completed: 'مكتملة',
    cancelled: 'ملغاة',
    noShow: 'لم يحضر',
    paymentsTab: 'المدفوعات',
    noPayments: 'لا توجد مدفوعات',
    paid: 'مدفوع',
    pending: 'معلق',
    overdue: 'متأخر',
    amount: 'المبلغ',
    date: 'التاريخ',
    status: 'الحالة',
    client: 'عميل',
    tempo: 'الإيقاع',
    cancel: 'إلغاء',
    saving: 'جاري الحفظ...',
    trainingSession: 'جلسة تدريب',
    payment: 'دفعة',
    due: 'الاستحقاق',
    paidLabel: 'مدفوع',
    method: 'الطريقة',
    failedAddProgress: 'فشل إضافة قياس التقدم',
  },
  social: {
    followInstagram: 'تابع على انستجرام',
    chatWhatsApp: 'تواصل عبر واتساب',
    followFacebook: 'تابع على فيسبوك',
  },
  alt: {
    gymBg: 'خلفية الجيم',
    coachPortrait: 'صورة كوتش كونان',
    achievements: 'الإنجازات',
    toggleMenu: 'فتح القائمة',
  },
}

const translations: Record<Language, Translations> = { en, ar }

interface I18nContextType {
  lang: Language
  t: Translations
  dir: 'ltr' | 'rtl'
  setLang: (lang: Language) => void
  toggleLang: () => void
}

const I18nContext = createContext<I18nContextType | null>(null)

// Always return 'ar' for server render to avoid hydration mismatch.
// The actual saved language is read from localStorage on the client after hydration.
const DEFAULT_LANG: Language = 'ar'

export function I18nProvider({ children }: { children: ReactNode }) {
  // Use simple React state for language - more reliable than useSyncExternalStore
  const [lang, setLangState] = useState<Language>(DEFAULT_LANG)
  const [mounted, setMounted] = useState(false)

  // On mount, read saved language from localStorage
  useEffect(() => {
    let savedLang: Language | null = null
    try {
      const saved = localStorage.getItem('coach_conan_lang') as Language | null
      if (saved === 'en' || saved === 'ar') {
        savedLang = saved
      }
    } catch { /* ignore */ }
    // Use a microtask to avoid the set-state-in-effect lint rule
    // This is safe because we're initializing state from an external store (localStorage)
    queueMicrotask(() => {
      if (savedLang) setLangState(savedLang)
      setMounted(true)
    })
  }, [])

  // Sync with LanguageContext (same-tab) — poll localStorage for changes
  useEffect(() => {
    if (!mounted) return
    const interval = setInterval(() => {
      try {
        const saved = localStorage.getItem('coach_conan_lang') as Language | null
        if (saved && (saved === 'en' || saved === 'ar') && saved !== lang) {
          setLangState(saved)
        }
      } catch { /* ignore */ }
    }, 400)
    return () => clearInterval(interval)
  }, [lang, mounted])

  // Update document direction when language changes
  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }, [lang])

  const setLang = useCallback((newLang: Language) => {
    localStorage.setItem('coach_conan_lang', newLang)
    setLangState(newLang)
  }, [])

  const toggleLang = useCallback(() => {
    setLangState(prev => {
      const newLang = prev === 'en' ? 'ar' : 'en'
      localStorage.setItem('coach_conan_lang', newLang)
      return newLang
    })
  }, [])

  const t = translations[lang]
  const dir = lang === 'ar' ? 'rtl' as const : 'ltr' as const

  return (
    <I18nContext.Provider value={{ lang, t, dir, setLang, toggleLang }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}
