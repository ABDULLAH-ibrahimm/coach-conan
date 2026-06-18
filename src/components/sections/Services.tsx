'use client'

import { motion } from 'framer-motion'
import { Dumbbell, Utensils, Video, Target, Users, Zap, CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SectionHeading from '@/components/shared/SectionHeading'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Services() {
  const { t, lang } = useLanguage()
  const isRTL = lang === 'ar'

  const SERVICES = [
    {
      icon: Dumbbell,
      title: t('services.s1.title'),
      description: t('services.s1.desc'),
      features: [t('services.s1.f1'), t('services.s1.f2'), t('services.s1.f3'), t('services.s1.f4')],
      image: '/images/coach-portrait.jpeg',
      imgClass: 'object-contain bg-black',
      popular: false,
    },
    {
      icon: Video,
      title: t('services.s2.title'),
      description: t('services.s2.desc'),
      features: [t('services.s2.f1'), t('services.s2.f2'), t('services.s2.f3'), t('services.s2.f4')],
      image: '/images/transformation.png',
      imgClass: 'object-contain bg-black',
      popular: true,
    },
    {
      icon: Utensils,
      title: t('services.s3.title'),
      description: t('services.s3.desc'),
      features: [t('services.s3.f1'), t('services.s3.f2'), t('services.s3.f3'), t('services.s3.f4')],
      image: '/images/nutrition.png',
      imgClass: 'object-contain bg-black',
      popular: false,
    },
    {
      icon: Target,
      title: t('services.s4.title'),
      description: t('services.s4.desc'),
      features: [t('services.s4.f1'), t('services.s4.f2'), t('services.s4.f3'), t('services.s4.f4')],
      image: '/images/t.png',
      imgClass: 'object-contain bg-black',
      popular: false,
    },
  ]

  const PROCESS_STEPS = [
    { step: '01', icon: Users, title: t('services.step1.title'), desc: t('services.step1.desc') },
    { step: '02', icon: Target, title: t('services.step2.title'), desc: t('services.step2.desc') },
    { step: '03', icon: Zap, title: t('services.step3.title'), desc: t('services.step3.desc') },
    { step: '04', icon: CheckCircle2, title: t('services.step4.title'), desc: t('services.step4.desc') },
  ]

  return (
    <section id="services" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full section-divider" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-red-950/5 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title={t('services.title')}
          subtitle={t('services.subtitle')}
        >
          <p className="text-muted-foreground mt-4">
            {t('services.desc')}
          </p>
        </SectionHeading>

        {/* Services Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-16">
          {SERVICES.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ y: 0 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative glass rounded-3xl overflow-hidden hover:border-red-600/30 transition-all duration-500"
            >
              {service.popular && (
                <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} z-10 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-red-600/30`}>
                  {t('services.popular')}
                </div>
              )}

              <div className="relative h-56 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  style={service.imgFilter ? { filter: service.imgFilter } : undefined}
                  className={`w-full h-full ${service.imgClass} group-hover:scale-105 transition-transform duration-700`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                <div className={`absolute bottom-4 ${isRTL ? 'right-6' : 'left-6'}`}>
                  <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-600/30 flex items-center justify-center">
                    <service.icon className="w-6 h-6 text-red-500" />
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
                <div className="space-y-2">
                  {service.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-red-500 shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                <a href="#contact">
                  <Button
                    variant="ghost"
                    className="w-full mt-4 text-red-400 hover:text-white hover:bg-red-600/10 border border-red-600/20 hover:border-red-600/40 group/btn"
                  >
                    {t('services.getStarted')}
                    <ArrowRight size={16} className={`${isRTL ? 'mr-2 rotate-180' : 'ml-2'} group-hover/btn:translate-x-1 transition-transform`} />
                  </Button>
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Process Steps */}
        <div className="mt-24">
          <SectionHeading
            title={t('services.process.title')}
            subtitle={t('services.process.subtitle')}
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {PROCESS_STEPS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ y: 0 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
                className="relative text-center group"
              >
                {/* Connector line */}
                {i < PROCESS_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-red-600/40 to-transparent" />
                )}
                
                <div className="relative mx-auto w-20 h-20 rounded-2xl bg-red-600/10 border border-red-600/20 flex items-center justify-center mb-5 group-hover:border-red-600/40 group-hover:bg-red-600/20 transition-all duration-300">
                  <step.icon className="w-8 h-8 text-red-500" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
                    {step.step}
                  </span>
                </div>
                <h4 className="text-white font-semibold mb-2">{step.title}</h4>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
