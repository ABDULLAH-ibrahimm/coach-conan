'use client'

import { motion } from 'framer-motion'
import { Award, Shield, BookOpen, Star, Trophy, Medal, BadgeCheck, Heart } from 'lucide-react'
import SectionHeading from '@/components/shared/SectionHeading'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Certificates() {
  const { t, lang } = useLanguage()
  const isRTL = lang === 'ar'

  const ACHIEVEMENTS = [
    { value: '6+', label: t('certs.a1') },
    { value: '+20', label: isRTL ? 'ورشة عمل' : 'Workshops' },
    { value: '+100', label: isRTL ? 'ساعة تعليم مستمر' : 'Hours of Education' },
    { value: '+10', label: isRTL ? 'سنوات معتمد' : 'Years Certified' },
    { value: '4', label: isRTL ? 'تخصصات' : 'Specializations' },
    { value: '98%', label: isRTL ? 'نجاح العملاء' : 'Client Success' },
  ]

  const CERTIFICATES = [
    {
      icon: Shield,
      title: isRTL ? 'مدرب شخصي معتمد NASM' : 'NASM Certified Personal Trainer',
      issuer: isRTL ? 'الأكاديمية الوطنية للطب الرياضي' : 'National Academy of Sports Medicine',
      year: '2016',
      description: isRTL
        ? 'شهادة معيار ذهبية للمدربين الشخصيين، تغطي التشريح والفيزيولوجيا وتصميم البرامج.'
        : 'Gold standard certification for personal trainers, covering anatomy, physiology, and program design.',
    },
    {
      icon: BookOpen,
      title: isRTL ? 'التغذية الدقيقة المستوى 1' : 'Precision Nutrition Level 1',
      issuer: isRTL ? 'بريسيشن نيوتريشن' : 'Precision Nutrition',
      year: '2017',
      description: isRTL
        ? 'شهادة تدريب تغذية مبنية على الأدلة تركز على تغيير السلوك والعادات المستدامة.'
        : 'Evidence-based nutrition coaching certification focusing on behavior change and sustainable habits.',
    },
    {
      icon: Award,
      title: isRTL ? 'مدرب لياقة جماعية ACE' : 'ACE Group Fitness Instructor',
      issuer: isRTL ? 'المجلس الأمريكي للتمرين' : 'American Council on Exercise',
      year: '2018',
      description: isRTL
        ? 'معتمد لقيادة فصول اللياقة الجماعية مع تعليم الأوضاع الصحيحة وبروتوكولات السلامة.'
        : 'Certified to lead group fitness classes with proper form instruction and safety protocols.',
    },
    {
      icon: Star,
      title: isRTL ? 'مدرب كروسفيت المستوى 1' : 'CrossFit Level 1 Trainer',
      issuer: isRTL ? 'كروسفيت إنك' : 'CrossFit Inc.',
      year: '2019',
      description: isRTL
        ? 'مدرب في أنماط الحركة الوظيفية ورفع الأثقال الأولمبي والبرمجة عالية الكثافة.'
        : 'Trained in functional movement patterns, Olympic weightlifting, and high-intensity programming.',
    },
    {
      icon: Trophy,
      title: isRTL ? 'تغذية رياضية ISSA' : 'ISSA Sports Nutrition',
      issuer: isRTL ? 'الرابطة الدولية للعلوم الرياضية' : 'International Sports Sciences Association',
      year: '2020',
      description: isRTL
        ? 'شهادة تغذية متقدمة تغطي تخطيط الماكرو والمكملات والاستراتيجيات الغذائية.'
        : 'Advanced nutrition certification covering macro planning, supplements, and dietary strategies.',
    },
    {
      icon: Heart,
      title: isRTL ? 'إسعافات أولية وإنقاذ' : 'CPR & First Aid',
      issuer: isRTL ? 'الهلال الأحمر الأمريكي' : 'American Red Cross',
      year: '2023',
      description: isRTL
        ? 'شهادة حالية في الإسعافات الأولية وإنعاش القلب والرئة، لضمان سلامة العملاء.'
        : 'Current certification in first aid and CPR, ensuring client safety at all times.',
    },
  ]

  return (
    <section id="certificates" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full section-divider" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-orange-600/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-red-600/5 rounded-full blur-[100px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title={t('certs.title')}
          subtitle={t('certs.subtitle')}
        >
          <p className="text-muted-foreground mt-4">
            {t('certs.desc')}
          </p>
        </SectionHeading>

        {/* Achievement Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-12 mb-16">
          {ACHIEVEMENTS.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="glass rounded-2xl p-5 text-center hover:border-red-600/30 transition-all duration-300 group"
            >
              <p className="text-2xl font-bold gradient-text">{item.value}</p>
              <p className="text-xs text-muted-foreground mt-1 group-hover:text-foreground transition-colors">{item.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Certificates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CERTIFICATES.map((cert, i) => (
            <motion.div
              key={cert.title}
              initial={{ y: 0 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group glass rounded-2xl p-6 hover:border-red-600/30 transition-all duration-300 relative overflow-hidden"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-600/20 flex items-center justify-center shrink-0 group-hover:border-red-600/40 transition-colors">
                    <cert.icon className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold group-hover:text-red-400 transition-colors">{cert.title}</h3>
                    <p className="text-xs text-red-400 font-medium mt-0.5">{cert.issuer}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{cert.description}</p>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                  <BadgeCheck size={14} className="text-red-500" />
                  <span className="text-xs text-muted-foreground">{t('certs.certified')} {cert.year}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Image Banner */}
        <motion.div
          initial={{ y: 0 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 relative rounded-3xl overflow-hidden border border-white/10"
        >
          <img
            src="/images/certificates.png"
            alt="Achievements"
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40 flex items-center">
            <div className="px-8 md:px-12">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">{t('certs.banner.title')}</h3>
              <p className="text-muted-foreground max-w-md">
                {t('certs.banner.desc')}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
