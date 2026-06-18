'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { TrendingUp, Dumbbell, Target, Flame, Users, Clock, Zap, Award } from 'lucide-react'
import SectionHeading from '@/components/shared/SectionHeading'
import { useLanguage } from '@/contexts/LanguageContext'

/* ───────────────── Animated Counter Hook ───────────────── */
function useAnimatedCounter(target: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const hasStarted = useRef(false)

  useEffect(() => {
    if (!startOnView || (isInView && !hasStarted.current)) {
      hasStarted.current = true
      const startTime = Date.now()
      const step = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        setCount(Math.round(eased * target))
        if (progress < 1) {
          requestAnimationFrame(step)
        }
      }
      requestAnimationFrame(step)
    }
  }, [target, duration, startOnView, isInView])

  return { count, ref }
}

/* ───────────────── Stat Card ───────────────── */
function StatCard({ icon: Icon, value, suffix, label }: { icon: React.ElementType; value: number; suffix: string; label: string }) {
  const { count, ref } = useAnimatedCounter(value, 2200)

  return (
    <motion.div
      ref={ref}
      initial={{ y: 0 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="glass rounded-2xl p-6 text-center group hover:border-red-600/30 transition-all duration-300 red-glow"
    >
      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-red-600/15 border border-red-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6 text-red-500" />
      </div>
      <p className="text-3xl md:text-4xl font-bold text-white">
        {count}<span className="text-red-500">{suffix}</span>
      </p>
      <p className="text-sm text-muted-foreground mt-2">{label}</p>
    </motion.div>
  )
}

/* ───────────────── Transformation Data ───────────────── */
interface TransformationData {
  initials: string
  name: string
  type: string
  typeBadge: string
  before: string
  after: string
  result: string
  quote: { en: string; ar: string }
  icon: React.ElementType
  accentColor: string
}

const TRANSFORMATIONS: TransformationData[] = [
  {
    initials: 'A.H.',
    name: 'A.H.',
    type: 'results.fatLoss',
    typeBadge: 'results.fatLoss',
    before: '92kg',
    after: '77kg',
    result: 'results.t1.result',
    quote: {
      en: "I never thought I could lose 15kg in just 12 weeks. Coach Conan's program was life-changing — the structure, the accountability, everything was perfect.",
      ar: 'مكنتوش متخيل إني هخسّ 15 كجم في 12 أسبوع بس. برنامج كوتش كونان غيّر حياتي — التنظيم والمتابعة حاجة تانية خالص.',
    },
    icon: Flame,
    accentColor: 'from-red-600 to-orange-500',
  },
  {
    initials: 'S.M.',
    name: 'S.M.',
    type: 'results.muscleGain',
    typeBadge: 'results.muscleGain',
    before: '65kg',
    after: '73kg',
    result: 'results.t2.result',
    quote: {
      en: "Gaining 8kg of pure muscle seemed impossible until I started with Coach Conan. His progressive overload approach and nutrition plan made it happen.",
      ar: 'اكتساب 8 كجم عضلات صافية كان حلم لحد ما بدأت مع كوتش كونان. أسلوبه في التحميل التدريجي وخطة التغذية خلّوا الحلم حقيقة.',
    },
    icon: Dumbbell,
    accentColor: 'from-orange-500 to-amber-500',
  },
  {
    initials: 'O.Y.',
    name: 'O.Y.',
    type: 'results.athletic',
    typeBadge: 'results.athletic',
    before: 'Base',
    after: '+40%',
    result: 'results.t3.result',
    quote: {
      en: "A 40% increase in overall strength in just 12 weeks. Coach Conan's advanced programming pushed me beyond what I thought were my limits.",
      ar: 'زيادة 40% في القوة الكلية في 12 أسبوع بس. البرمجة المتقدمة من كوتش كونان خلّتني أتجاوز حدودي.',
    },
    icon: TrendingUp,
    accentColor: 'from-amber-500 to-yellow-500',
  },
  {
    initials: 'M.K.',
    name: 'M.K.',
    type: 'results.recomp',
    typeBadge: 'results.recomp',
    before: '85kg',
    after: '77kg',
    result: 'results.t4.result',
    quote: {
      en: "Losing 12kg of fat while gaining 4kg of muscle — that's the power of proper body recomposition. Coach Conan knows exactly what he's doing.",
      ar: 'خسارة 12 كجم دهون مع اكتساب 4 كجم عضلات — دي قوة إعادة تشكيل الجسم الصح. كوتش كونان عارف بيعمل إيه بالظبط.',
    },
    icon: Target,
    accentColor: 'from-yellow-500 to-lime-500',
  },
]

/* ───────────────── Transformation Card ───────────────── */
function TransformationCard({ data, index, lang }: { data: TransformationData; index: number; lang: 'en' | 'ar' }) {
  const { t } = useLanguage()
  const isRTL = lang === 'ar'

  return (
    <motion.div
      initial={{ y: 0 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="glass rounded-2xl overflow-hidden group hover:border-red-600/30 transition-all duration-500 red-glow"
    >
      {/* Top accent bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${data.accentColor}`} />

      <div className="p-6">
        {/* Header: Avatar + Name + Badge */}
        <div className="flex items-center gap-4 mb-5">
          {/* Avatar with initials */}
          <div className={`relative flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${data.accentColor} flex items-center justify-center shadow-lg`}>
            <span className="text-white font-bold text-lg">{data.initials.charAt(0)}</span>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-background border border-white/10 flex items-center justify-center">
              <data.icon className="w-3.5 h-3.5 text-red-400" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-bold text-white">{data.name}</h4>
            {/* Type badge */}
            <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full bg-red-600/15 border border-red-600/20 text-red-400 text-xs font-medium">
              <data.icon className="w-3 h-3" />
              {t(data.type)}
            </span>
          </div>
        </div>

        {/* Before / After Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-xl bg-white/5 border border-white/5 p-3 text-center">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
              {t('results.before')}
            </p>
            <p className="text-xl font-bold text-white/70">{data.before}</p>
          </div>
          <div className="rounded-xl bg-red-600/10 border border-red-600/15 p-3 text-center">
            <p className="text-[11px] uppercase tracking-wider text-red-400 mb-1">
              {t('results.after')}
            </p>
            <p className="text-xl font-bold text-white">{data.after}</p>
          </div>
        </div>

        {/* Result summary */}
        <div className={`inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-lg bg-gradient-to-r ${data.accentColor} bg-opacity-20`}>
          <TrendingUp className="w-4 h-4 text-white" />
          <span className="text-sm font-semibold text-white">{t(data.result)}</span>
        </div>

        {/* Quote */}
        <div className="relative mt-3 pl-4 border-l-2 border-red-600/30">
          <p className="text-sm text-muted-foreground leading-relaxed italic">
            &ldquo;{isRTL ? data.quote.ar : data.quote.en}&rdquo;
          </p>
        </div>
      </div>
    </motion.div>
  )
}

/* ───────────────── Main Section ───────────────── */
export default function Transformations() {
  const { t, lang } = useLanguage()

  const STATS = [
    { icon: Users, value: 500, suffix: '+', label: t('results.stat.transformations') },
    { icon: TrendingUp, value: 95, suffix: '%', label: t('results.stat.successRate') },
    { icon: Clock, value: 12, suffix: '', label: t('results.stat.avgWeeks') },
    { icon: Award, value: 10, suffix: '+', label: t('results.stat.yearsExp') },
  ]

  return (
    <section id="results" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-0 w-full section-divider" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-red-950/5 to-background" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[200px]" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-600/3 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <SectionHeading
          title={t('results.title')}
          subtitle={t('results.subtitle')}
        >
          <p className="text-muted-foreground mt-4">
            {t('results.desc')}
          </p>
        </SectionHeading>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-12 mb-16">
          {STATS.map((stat, i) => (
            <StatCard
              key={stat.label}
              icon={stat.icon}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
            />
          ))}
        </div>

        {/* Transformation Cards */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {TRANSFORMATIONS.map((data, i) => (
            <TransformationCard
              key={data.name}
              data={data}
              index={i}
              lang={lang}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ y: 0 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-2 text-sm">
            {t('results.cta.sub')}
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold hover:from-red-700 hover:to-orange-700 transition-all shadow-lg shadow-red-600/20 hover:shadow-red-600/40"
          >
            <Zap className="w-5 h-5" />
            {t('results.cta.btn')}
          </a>
        </motion.div>
      </div>
    </section>
  )
}
