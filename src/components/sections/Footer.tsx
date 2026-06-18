'use client'

import { Dumbbell, Heart } from 'lucide-react'
import SocialIcons from '@/components/shared/SocialIcons'
import { useLanguage } from '@/contexts/LanguageContext'
import Link from 'next/link'

export default function Footer() {
  const { t, lang } = useLanguage()
  const isRTL = lang === 'ar'

  const QUICK_LINKS = [
    { label: t('nav.home'), href: '#home' },
    { label: t('nav.about'), href: '#about' },
    { label: t('nav.services'), href: '#services' },
    { label: t('nav.achievements'), href: '#certificates' },
    { label: t('nav.testimonials'), href: '#testimonials' },
    { label: t('nav.contact'), href: '#contact' },
  ]

  const SERVICE_LINKS = [
    isRTL ? 'تدريب شخصي' : 'Personal Training',
    isRTL ? 'تدريب أونلاين' : 'Online Coaching',
    isRTL ? 'تخطيط التغذية' : 'Nutrition Planning',
    isRTL ? 'تحويل الجسم' : 'Body Transformation',
  ]

  return (
    <footer className="relative border-t border-white/5 bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1 space-y-4">
            <a href="#home" className="flex items-center gap-2 group">
              <Dumbbell className="w-7 h-7 text-red-500 transition-transform group-hover:rotate-12 duration-300" />
              <span className="text-lg font-bold text-white tracking-tight">
                COACH <span className="gradient-text">CONAN</span>
              </span>
            </a>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('footer.desc')}
            </p>
            <SocialIcons size={18} />
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-red-400 transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-red-400 transition-colors duration-200">
                  {t('nav.admin')}
                </Link>
              </li>
              <li>
                <Link href="/client-portal" className="text-sm text-muted-foreground hover:text-red-400 transition-colors duration-200">
                  {t('nav.clientPortal')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">{t('footer.services')}</h4>
            <ul className="space-y-2">
              {SERVICE_LINKS.map((service) => (
                <li key={service}>
                  <a
                    href="#services"
                    className="text-sm text-muted-foreground hover:text-red-400 transition-colors duration-200"
                  >
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">{t('footer.getInTouch')}</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>{isRTL ? 'جيم فِت هَب، القاهرة، مصر' : 'FitHub Gym, Cairo, Egypt'}</p>
              <p>+20 111 934 4441</p>
              <p>coach@connanfitness.com</p>
              <div className="pt-2">
                <a
                  href="https://wa.me/201119344441"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600/10 border border-green-600/20 rounded-lg px-3 py-2 text-green-400 text-xs font-medium hover:bg-green-600/20 transition-colors"
                >
                  {t('contact.chatWhatsApp')}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Coach Conan. {t('footer.rights')}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {t('footer.madeIn')} <Heart size={12} className="text-red-500 fill-red-500" />
          </p>
        </div>
      </div>
    </footer>
  )
}
