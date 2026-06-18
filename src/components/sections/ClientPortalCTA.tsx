'use client'

import { motion } from 'framer-motion'
import { LogIn, Dumbbell, Utensils, TrendingUp, Calendar, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SectionHeading from '@/components/shared/SectionHeading'
import { useI18n } from '@/lib/i18n'

const FEATURE_ICONS = [Dumbbell, Utensils, TrendingUp, Calendar]

interface ClientPortalCTAProps {
  onNavigate?: (view: 'client-portal') => void
}

export default function ClientPortalCTA({ onNavigate }: ClientPortalCTAProps) {
  const { t, dir } = useI18n()

  return (
    <section className="relative py-24 md:py-32 overflow-hidden" dir={dir}>
      {/* Background */}
      <div className="absolute top-0 left-0 w-full section-divider" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-red-950/5 to-background" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass rounded-3xl overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Left Side - Text */}
            <motion.div
              initial={{ x: 0 }}
              whileInView={{ x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="p-8 md:p-12 lg:p-16 flex flex-col justify-center"
            >
              <SectionHeading
                title={t.portalCta.sectionTitle}
                subtitle={t.portalCta.sectionSubtitle}
                align="left"
              >
                <div className="text-start">
                  <p className="text-muted-foreground mt-4 leading-relaxed">
                    {t.portalCta.description}
                  </p>
                </div>
              </SectionHeading>

              {/* Feature List */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                {t.portalCta.features.map((feature, i) => {
                  const Icon = FEATURE_ICONS[i]
                  return (
                    <motion.div
                      key={feature.label}
                      initial={{ y: 0 }}
                      whileInView={{ y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-9 h-9 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center shrink-0">
                        <Icon size={16} className="text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{feature.label}</p>
                        <p className="text-xs text-muted-foreground">{feature.desc}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* CTA Button */}
              <div className="mt-10">
                <Button
                  size="lg"
                  onClick={() => onNavigate?.('client-portal')}
                  className="bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/25 group"
                >
                  <LogIn size={18} className="mr-2" />
                  {t.portalCta.loginButton}
                  <ChevronRight size={16} className="ms-1 rtl:rotate-180 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>

            {/* Right Side - Portal Mockup */}
            <motion.div
              initial={{ x: 0 }}
              whileInView={{ x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative p-8 md:p-12 lg:p-16 flex items-center justify-center bg-gradient-to-br from-red-950/20 to-transparent"
            >
              <div className="w-full max-w-sm">
                {/* Mockup Header */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xs text-muted-foreground ms-2">{t.portalCta.portalHeader}</span>
                </div>

                {/* Mockup Cards */}
                <div className="space-y-3">
                  {/* Workout Card */}
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4 hover:border-red-600/20 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Dumbbell size={14} className="text-red-500" />
                        <span className="text-xs font-medium text-white">{t.portalCta.todayWorkout}</span>
                      </div>
                      <span className="text-[10px] text-red-400 bg-red-600/10 px-2 py-0.5 rounded-full">{t.portalCta.active}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{t.portalCta.mockWorkoutDesc}</p>
                    <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-red-600 to-orange-500" />
                    </div>
                  </div>

                  {/* Nutrition Card */}
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4 hover:border-red-600/20 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Utensils size={14} className="text-red-500" />
                        <span className="text-xs font-medium text-white">{t.portalCta.nutritionPlan}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{t.portalCta.mockCalories}</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <div className="flex-1 text-center rounded-lg bg-white/5 p-1.5">
                        <p className="text-[10px] text-red-400 font-medium">140g</p>
                        <p className="text-[9px] text-muted-foreground">{t.portalCta.mockProtein}</p>
                      </div>
                      <div className="flex-1 text-center rounded-lg bg-white/5 p-1.5">
                        <p className="text-[10px] text-amber-400 font-medium">200g</p>
                        <p className="text-[9px] text-muted-foreground">{t.portalCta.mockCarbs}</p>
                      </div>
                      <div className="flex-1 text-center rounded-lg bg-white/5 p-1.5">
                        <p className="text-[10px] text-orange-400 font-medium">60g</p>
                        <p className="text-[9px] text-muted-foreground">{t.portalCta.mockFats}</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Card */}
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4 hover:border-red-600/20 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={14} className="text-red-500" />
                        <span className="text-xs font-medium text-white">{t.portalCta.progress}</span>
                      </div>
                      <span className="text-[10px] text-green-400">{t.portalCta.mockWeightLoss}</span>
                    </div>
                    <div className="flex items-end gap-1 mt-2 h-8">
                      {[40, 55, 45, 65, 50, 70, 60, 80, 75, 90].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-sm bg-gradient-to-t from-red-600/60 to-red-500/30"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Session Card */}
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4 hover:border-red-600/20 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-red-500" />
                        <span className="text-xs font-medium text-white">{t.portalCta.nextSession}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{t.portalCta.mockTomorrow}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
