'use client'

import { useState, useEffect } from 'react'
import { Menu, X, Dumbbell, Globe, LayoutDashboard, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Navbar() {
  const { t, lang, setLang } = useLanguage()
  const isRTL = lang === 'ar'
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const NAV_ITEMS = [
    { label: t('nav.home'), href: '#home' },
    { label: t('nav.about'), href: '#about' },
    { label: t('nav.services'), href: '#services' },
    { label: t('nav.achievements'), href: '#certificates' },
    { label: t('nav.testimonials'), href: '#testimonials' },
    { label: t('nav.contact'), href: '#contact' },
  ]

  const goToView = (view: string) => {
    window.location.href = `/?view=${view}`
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'glass shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2 group">
            <div className="relative">
              <Dumbbell className="w-8 h-8 text-red-500 transition-transform group-hover:rotate-12 duration-300" />
              <div className="absolute inset-0 w-8 h-8 bg-red-500/20 rounded-full blur-lg" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              COACH <span className="gradient-text">CONAN</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/5"
              >
                {item.label}
              </a>
            ))}
            <a href="#contact">
              <Button className="mx-2 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 transition-all duration-300 hover:shadow-red-600/40">
                {t('nav.bookNow')}
              </Button>
            </a>
            <div className="flex items-center gap-1 ms-2 border-s border-white/10 ps-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => goToView('client-portal')}
                title={t('nav.clients')}
                className="text-muted-foreground hover:text-red-400 h-9 gap-1.5"
              >
                <Users className="h-4 w-4" />
                <span className="text-xs">{t('nav.clients')}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => goToView('dashboard')}
                title={t('nav.admin')}
                className="text-muted-foreground hover:text-red-400 h-9 gap-1.5"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="text-xs hidden xl:inline">{t('nav.admin')}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                className="text-muted-foreground hover:text-red-400 h-9"
              >
                <Globe className="h-4 w-4 me-1" />
                <span className="text-xs">{lang === 'en' ? 'عربي' : 'EN'}</span>
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="text-muted-foreground hover:text-red-400 h-9"
            >
              <Globe className="h-4 w-4 me-1" />
              <span className="text-xs">{lang === 'en' ? 'عربي' : 'EN'}</span>
            </Button>
            <button
              className="text-white p-2"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden transition-all duration-300 overflow-hidden ${
          isMobileOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="glass border-t border-white/10 px-4 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className="block px-4 py-3 text-muted-foreground hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              {item.label}
            </a>
          ))}
          <a href="#contact" onClick={() => setIsMobileOpen(false)}>
            <Button className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white">
              {t('nav.bookNow')}
            </Button>
          </a>
          <div className="flex items-center gap-2 pt-2 border-t border-white/10 mt-2">
            <Button
              variant="outline"
              onClick={() => { setIsMobileOpen(false); goToView('client-portal') }}
              className="flex-1 border-white/10 text-muted-foreground hover:text-red-400 hover:border-red-500/30"
            >
              <Users className="h-4 w-4 me-2" />
              {t('nav.clients')}
            </Button>
            <Button
              variant="outline"
              onClick={() => { setIsMobileOpen(false); goToView('dashboard') }}
              className="flex-1 border-white/10 text-muted-foreground hover:text-red-400 hover:border-red-500/30"
            >
              <LayoutDashboard className="h-4 w-4 me-2" />
              {t('nav.admin')}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
