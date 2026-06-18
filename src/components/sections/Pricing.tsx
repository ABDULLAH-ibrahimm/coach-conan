'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Zap, Crown, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SectionHeading from '@/components/shared/SectionHeading'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Pricing() {
  const { t, formatPrice, lang } = useLanguage()
  const isRTL = lang === 'ar'

  const tiers = [
    {
      name: t('pricing.starter'),
      price: 4500,
      icon: Zap,
      popular: false,
      features: [
        t('pricing.starter.f1'),
        t('pricing.starter.f2'),
        t('pricing.starter.f3'),
        t('pricing.starter.f4'),
      ],
    },
    {
      name: t('pricing.professional'),
      price: 8500,
      icon: Star,
      popular: true,
      features: [
        t('pricing.professional.f1'),
        t('pricing.professional.f2'),
        t('pricing.professional.f3'),
        t('pricing.professional.f4'),
        t('pricing.professional.f5'),
        t('pricing.professional.f6'),
        t('pricing.professional.f7'),
      ],
    },
    {
      name: t('pricing.elite'),
      price: 15000,
      icon: Crown,
      popular: false,
      features: [
        t('pricing.elite.f1'),
        t('pricing.elite.f2'),
        t('pricing.elite.f3'),
        t('pricing.elite.f4'),
        t('pricing.elite.f5'),
        t('pricing.elite.f6'),
        t('pricing.elite.f7'),
        t('pricing.elite.f8'),
      ],
    },
  ]

  return (
    <section id="pricing" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full section-divider" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-red-950/5 to-background" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/5 rounded-full blur-[200px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title={t('pricing.title')}
          subtitle={t('pricing.subtitle')}
        >
          <p className="text-muted-foreground mt-4">
            {t('pricing.desc')}
          </p>
        </SectionHeading>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mt-16">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ y: 0 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className={`relative group glass rounded-3xl overflow-hidden transition-all duration-500 flex flex-col ${
                tier.popular
                  ? 'border-2 border-red-500/60 shadow-lg shadow-red-600/20 md:scale-105 md:z-10'
                  : 'hover:border-red-600/30'
              }`}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-600 to-red-500 text-white text-center py-2 text-xs font-bold tracking-wider uppercase">
                  {t('pricing.mostPopular')}
                </div>
              )}

              <div className={`p-6 lg:p-8 flex flex-col flex-1 ${tier.popular ? 'pt-12' : ''}`}>
                {/* Icon & Name */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    tier.popular
                      ? 'bg-red-600/20 border border-red-500/30'
                      : 'bg-red-600/10 border border-red-600/20'
                  }`}>
                    <tier.icon className={`w-6 h-6 ${tier.popular ? 'text-red-400' : 'text-red-500'}`} />
                  </div>
                  <h3 className={`text-xl font-bold ${tier.popular ? 'text-red-400' : 'text-white'}`}>
                    {tier.name}
                  </h3>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl lg:text-5xl font-extrabold ${tier.popular ? 'gradient-text' : 'text-white'}`}>
                      {formatPrice(tier.price)}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {t('pricing.month')}
                  </span>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-red-600/20 to-transparent mb-6" />

                {/* Features */}
                <div className="space-y-3 flex-1">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <CheckCircle2
                        size={16}
                        className={`shrink-0 ${
                          tier.popular ? 'text-red-400' : 'text-red-500/70'
                        }`}
                      />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <a href="#contact" className="mt-8 block">
                  <Button
                    className={`w-full font-semibold text-sm h-12 rounded-xl transition-all duration-300 ${
                      tier.popular
                        ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg shadow-red-600/25 hover:shadow-red-500/40'
                        : 'bg-transparent border border-red-600/30 text-red-400 hover:bg-red-600/10 hover:border-red-500/50 hover:text-white'
                    }`}
                  >
                    {t('pricing.cta')}
                  </Button>
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Note */}
        <motion.p
          initial={{ opacity: 1 }}
          whileInView={{}}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-12 max-w-xl mx-auto"
        >
          {t('pricing.note')}
        </motion.p>
      </div>
    </section>
  )
}
