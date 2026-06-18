'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { Star, TrendingUp, Users, Clock, Award, Quote } from 'lucide-react'
import SectionHeading from '@/components/shared/SectionHeading'
import { useI18n } from '@/lib/i18n'

const STATS_CONFIG = [
  { value: 500, suffix: '+', icon: TrendingUp },
  { value: 98, suffix: '%', icon: Users },
  { value: 12, suffix: '', icon: Clock },
  { value: 8, suffix: '+', icon: Award },
]

const CARD_INITIALS = ['A.H.', 'S.M.', 'O.Y.', 'M.K.']

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const duration = 2000
    const increment = value / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [isInView, value])

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-extrabold gradient-text">
      {count}{suffix}
    </div>
  )
}

export default function Results() {
  const { t, lang, dir } = useI18n()

  const statLabels = [
    t.results.transformations,
    t.results.successRate,
    t.results.averageResults,
    t.results.yearsExperience,
  ]

  return (
    <section id="results" className="relative py-24 md:py-32 overflow-hidden" dir={dir}>
      {/* Background */}
      <div className="absolute top-0 left-0 w-full section-divider" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-red-950/5 to-background" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title={t.results.sectionTitle}
          subtitle={t.results.sectionSubtitle}
        >
          <p className="text-muted-foreground mt-4">
            {t.results.description}
          </p>
        </SectionHeading>

        {/* Stats Counter */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {STATS_CONFIG.map((stat, i) => (
            <motion.div
              key={statLabels[i]}
              initial={{ y: 0 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass rounded-2xl p-6 text-center hover:border-red-600/20 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-600/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-red-600/20 transition-colors">
                <stat.icon className="w-6 h-6 text-red-500" />
              </div>
              <AnimatedCounter value={stat.value} suffix={i === 2 ? ` ${t.results.weeks}` : stat.suffix} />
              <p className="text-sm text-muted-foreground mt-2">{statLabels[i]}</p>
            </motion.div>
          ))}
        </div>

        {/* Result Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {t.results.cards.map((card, i) => (
            <motion.div
              key={CARD_INITIALS[i]}
              initial={{ y: 0 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass rounded-2xl p-6 hover:border-red-600/20 transition-all duration-300 group relative"
            >
              <Quote className="absolute top-4 end-4 w-6 h-6 text-red-600/10" />

              {/* Client Initials & Goal */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-600/20 border border-red-600/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-red-400">{CARD_INITIALS[i]}</span>
                </div>
                <div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-600/10 text-red-400 border border-red-600/20">
                    {card.goal}
                  </span>
                </div>
              </div>

              {/* Result Summary */}
              <h4 className="text-white font-bold text-sm mb-3">{card.result}</h4>

              {/* Testimonial */}
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                &ldquo;{card.testimonial}&rdquo;
              </p>

              {/* Star Rating */}
              <div className="flex gap-0.5 pt-3 border-t border-white/5">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star key={si} size={12} className="text-yellow-500 fill-yellow-500" />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
