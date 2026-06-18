'use client'

import { motion } from 'framer-motion'
import { ChevronDown, Play, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SocialIcons from '@/components/shared/SocialIcons'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Hero() {
  const { t, lang } = useLanguage()
  const isRTL = lang === 'ar'

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/images/gym-bg.png"
          alt="Gym Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Red accent glow */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-orange-600/5 rounded-full blur-[100px]" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Text */}
          <div className="space-y-8">
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-600/20 rounded-full px-4 py-2 mb-6">
                <Zap size={14} className="text-red-500" />
                <span className="text-red-400 text-sm font-medium">{t('hero.badge')}</span>
              </div>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight"
              initial={{ y: 0 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {t('hero.title1')}
              <br />
              <span className="gradient-text">{t('hero.title2')}</span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed"
              initial={{ y: 0 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {t('hero.desc')}
            </motion.p>

            <motion.div
              className="flex flex-wrap items-center gap-4"
              initial={{ y: 0 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <a href="#contact">
                <Button
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-600/30 hover:shadow-red-600/50 transition-all duration-300 hover:scale-105 text-base px-8 h-14"
                >
                  {t('hero.cta1')}
                </Button>
              </a>
              <a href="#services">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300 h-14 px-8 text-base"
                >
                  <Play size={16} className={isRTL ? 'ml-2' : 'mr-2'} />
                  {t('hero.cta2')}
                </Button>
              </a>
            </motion.div>

            <motion.div
              className="pt-4"
              initial={{ opacity: 1 }}
              animate={{}}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <p className="text-sm text-muted-foreground mb-3">{t('hero.follow')}</p>
              <SocialIcons size={22} />
            </motion.div>
          </div>

          {/* Right - Coach Image */}
          <motion.div
            className="relative hidden lg:flex flex-col items-center"
            initial={{ x: 0 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Circular photo with glow ring */}
            <div className="relative">
              {/* Outer glow ring */}
              <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-red-600/40 via-orange-500/20 to-red-600/40 blur-md" />
              {/* Border ring */}
              <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-red-600 via-orange-500 to-red-600" />
              
              <div className="relative w-[420px] h-[420px] rounded-full overflow-hidden bg-black/60">
                <img
                  src="/images/hero-coach.jpeg"
                  alt="Coach Conan - Personal Trainer"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>

            {/* Stats below circle */}
            <div className="flex gap-4 mt-8">
              <div className="glass rounded-2xl p-4 text-center min-w-[110px]">
                <p className="text-2xl font-bold text-white">10+</p>
                <p className="text-xs text-muted-foreground">{t('hero.yearsExp')}</p>
              </div>
              <div className="glass rounded-2xl p-4 text-center min-w-[110px]">
                <p className="text-2xl font-bold text-white">14K+</p>
                <p className="text-xs text-muted-foreground">{t('hero.followers')}</p>
              </div>
              <div className="glass rounded-2xl p-4 text-center min-w-[110px]">
                <p className="text-2xl font-bold text-white">500+</p>
                <p className="text-xs text-muted-foreground">{t('hero.results')}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <a href="#about" className="flex flex-col items-center gap-2 text-muted-foreground hover:text-white transition-colors">
          <span className="text-xs tracking-widest uppercase">{t('hero.scroll')}</span>
          <ChevronDown size={20} />
        </a>
      </motion.div>
    </section>
  )
}
