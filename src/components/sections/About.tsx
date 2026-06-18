'use client'

import { motion } from 'framer-motion'
import { Award, Users, Target, Calendar, TrendingUp, Heart } from 'lucide-react'
import SectionHeading from '@/components/shared/SectionHeading'
import { useLanguage } from '@/contexts/LanguageContext'

export default function About() {
  const { t, lang } = useLanguage()
  const isRTL = lang === 'ar'

  const STATS = [
    { icon: Calendar, value: '10+', label: t('about.stat.years') },
    { icon: Users, value: '500+', label: t('about.stat.clients') },
    { icon: TrendingUp, value: '95%', label: t('about.stat.success') },
    { icon: Heart, value: '100%', label: t('about.stat.satisfaction') },
  ]

  const MILESTONES = isRTL ? [
    { year: '2014', title: 'بدأت التدريب', desc: 'بدأت رحلتي كمدرب شخصي معتمد' },
    { year: '2016', title: 'مدرب رئيسي', desc: 'أصبحت مدرباً رئيسياً في القاهرة' },
    { year: '2018', title: 'التدريب أونلاين', desc: 'أطلقت برامج التدريب أونلاين' },
    { year: '2020', title: '+500 عميل', desc: 'وصلت لـ 500+ تحول ناجح' },
    { year: '2022', title: '14K متابع', desc: 'بنت مجتمع قوي على السوشيال ميديا' },
    { year: '2024', title: 'برامج متقدمة', desc: 'طورت أنظمة تدريب متقدمة' },
  ] : [
    { year: '2014', title: 'Started Training', desc: 'Began my journey as a certified personal trainer' },
    { year: '2016', title: 'Lead Trainer', desc: 'Became a lead trainer in Cairo' },
    { year: '2018', title: 'Online Coaching', desc: 'Launched online coaching programs' },
    { year: '2020', title: '500+ Clients', desc: 'Reached 500+ successful transformations' },
    { year: '2022', title: '14K Followers', desc: 'Built a strong social media community' },
    { year: '2024', title: 'Advanced Programs', desc: 'Developed advanced training systems' },
  ]

  return (
    <section id="about" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-0 w-full section-divider" />
      <div className="absolute top-1/3 -right-32 w-64 h-64 bg-red-600/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/3 -left-32 w-64 h-64 bg-orange-600/5 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title={t('about.title')}
          subtitle={t('about.subtitle')}
        />

        <div className="grid lg:grid-cols-2 gap-16 items-start mt-16">
          {/* Left - Image & Stats */}
          <motion.div
            initial={{ x: 0 }}
            whileInView={{ x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative flex flex-col items-center">
              {/* Circular portrait with glow ring */}
              <div className="relative">
                <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-red-600/40 via-orange-500/20 to-red-600/40 blur-md" />
                <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-red-600 via-orange-500 to-red-600" />
                
                <div className="relative w-[340px] h-[340px] rounded-full overflow-hidden bg-black/60">
                  <img
                    src="/images/coach-about.png"
                    alt="Coach Conan Portrait"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mt-8 w-full max-w-[340px]">
                {STATS.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ y: 0 }}
                    whileInView={{ y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="glass rounded-2xl p-5 text-center group hover:border-red-600/30 transition-all duration-300"
                  >
                    <stat.icon className="w-6 h-6 text-red-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right - Story & Timeline */}
          <motion.div
            initial={{ x: 0 }}
            whileInView={{ x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="space-y-6 mb-10">
              <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-600/20 rounded-full px-4 py-2">
                <Award size={14} className="text-red-500" />
                <span className="text-red-400 text-sm font-medium">{t('about.badge')}</span>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                {t('about.heading')}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {t('about.p1')}
              </p>
              
              <p className="text-muted-foreground leading-relaxed">
                {t('about.p2')}
              </p>

              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-red-500" />
                  <span className="text-sm text-muted-foreground">{t('about.scienceBased')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-red-500" />
                  <span className="text-sm text-muted-foreground">{t('about.certifiedPro')}</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-0">
              <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                {t('about.journey')}
              </h4>
              <div className="relative">
                <div className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 bottom-3 w-px bg-gradient-to-b from-red-600 via-red-600/50 to-transparent`} />
                <div className="space-y-6">
                  {MILESTONES.map((milestone, i) => (
                    <motion.div
                      key={milestone.year}
                      initial={{ x: 0 }}
                      whileInView={{ x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className={`relative ${isRTL ? 'pr-10' : 'pl-10'} group`}
                    >
                      <div className={`absolute ${isRTL ? 'right-1.5' : 'left-1.5'} top-2 w-3 h-3 bg-red-600 rounded-full border-2 border-background group-hover:scale-125 transition-transform`} />
                      <div className="glass rounded-xl p-4 hover:border-red-600/30 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-red-500 font-bold text-sm">{milestone.year}</span>
                          <span className="text-white font-semibold">{milestone.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{milestone.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
