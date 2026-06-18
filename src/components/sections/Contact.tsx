'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, MapPin, Phone, Mail, Clock, Instagram, Facebook, MessageCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import SectionHeading from '@/components/shared/SectionHeading'
import { useLanguage } from '@/contexts/LanguageContext'

const SOCIAL_LINKS = [
  {
    name: 'Instagram',
    icon: Instagram,
    href: 'https://www.instagram.com/coach_connan?igsh=MTl5d3R6OG5hbjEzMQ==',
    color: 'from-pink-600 to-purple-600',
    followers: '14K+',
  },
  {
    name: 'WhatsApp',
    icon: MessageCircle,
    href: 'https://wa.me/201119344441',
    color: 'from-green-600 to-emerald-600',
    followers: 'Direct',
  },
  {
    name: 'Facebook',
    icon: Facebook,
    href: 'https://www.facebook.com/share/1Gsw6HxmBS/?mibextid=wwXIfr',
    color: 'from-blue-600 to-blue-700',
    followers: 'Follow',
  },
]

export default function Contact() {
  const { t, lang } = useLanguage()
  const isRTL = lang === 'ar'

  const CONTACT_INFO = [
    {
      icon: MapPin,
      title: t('contact.location'),
      detail: isRTL ? 'جيم فِت هَب، القاهرة، مصر' : 'FitHub Gym, Cairo, Egypt',
      sub: isRTL ? 'فروع القاهرة الجديدة والشيخ زايد' : 'New Cairo & Sheikh Zayed branches',
    },
    {
      icon: Phone,
      title: t('contact.phone'),
      detail: '+20 111 934 4441',
      sub: isRTL ? 'متاح يوميًا 8ص - 10م' : 'Available daily 8AM - 10PM',
    },
    {
      icon: Mail,
      title: t('contact.email'),
      detail: 'coach@connanfitness.com',
      sub: isRTL ? 'الرد خلال 24 ساعة' : 'Response within 24 hours',
    },
    {
      icon: Clock,
      title: t('contact.hours'),
      detail: isRTL ? 'السبت - الخميس: 8ص - 10م' : 'Sat - Thu: 8AM - 10PM',
      sub: isRTL ? 'الجمعة: بالحجز' : 'Friday: By appointment',
    },
  ]

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Something went wrong')
      }

      setIsSuccess(true)
      setFormData({ name: '', email: '', phone: '', service: '', message: '' })
      setTimeout(() => setIsSuccess(false), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full section-divider" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-red-950/5 to-background" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-[120px]" />
      <div className="absolute top-1/3 left-0 w-64 h-64 bg-orange-600/5 rounded-full blur-[100px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title={t('contact.title')}
          subtitle={t('contact.subtitle')}
        >
          <p className="text-muted-foreground mt-4">
            {t('contact.desc')}
          </p>
        </SectionHeading>

        <div className="grid lg:grid-cols-5 gap-8 mt-16">
          {/* Left - Contact Info & Social */}
          <motion.div
            initial={{ x: 0 }}
            whileInView={{ x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Contact Info Cards */}
            {CONTACT_INFO.map((info, i) => (
              <motion.div
                key={info.title}
                initial={{ y: 0 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="glass rounded-2xl p-5 flex items-start gap-4 group hover:border-red-600/30 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center shrink-0 group-hover:border-red-600/40 transition-colors">
                  <info.icon size={18} className="text-red-500" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm">{info.title}</h4>
                  <p className="text-foreground text-sm mt-0.5">{info.detail}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{info.sub}</p>
                </div>
              </motion.div>
            ))}

            {/* Social Links */}
            <div className="space-y-3 pt-4">
              <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                {t('contact.connect')}
              </h4>
              <div className="space-y-3">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 glass rounded-2xl p-4 group hover:border-white/20 transition-all duration-300"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${social.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <social.icon size={18} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{social.name}</p>
                      <p className="text-xs text-muted-foreground">{social.followers}</p>
                    </div>
                    <Send size={14} className="text-muted-foreground group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right - Contact Form */}
          <motion.div
            initial={{ x: 0 }}
            whileInView={{ x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="glass rounded-3xl p-6 md:p-8">
              <h3 className="text-xl font-bold text-white mb-2">{t('contact.form.title')}</h3>
              <p className="text-sm text-muted-foreground mb-8">{t('contact.form.desc')}</p>

              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16 space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-green-600/20 border border-green-600/30 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={32} className="text-green-500" />
                  </div>
                  <h4 className="text-xl font-bold text-white">{t('contact.form.success')}</h4>
                  <p className="text-muted-foreground text-sm">{t('contact.form.successDesc')}</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">{t('contact.form.name')}</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={isRTL ? 'اسمك' : 'Your name'}
                        required
                        className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-red-600/50 focus:ring-red-600/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">{t('contact.form.emailLabel')}</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        required
                        className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-red-600/50 focus:ring-red-600/20"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">{t('contact.form.phoneLabel')}</label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+20 xxx xxx xxxx"
                        className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-red-600/50 focus:ring-red-600/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">{t('contact.form.interested')}</label>
                      <select
                        value={formData.service}
                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                        className="w-full h-9 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:border-red-600/50 focus:ring-1 focus:ring-red-600/20"
                      >
                        <option value="" className="bg-card">{t('contact.form.selectService')}</option>
                        <option value="personal-training" className="bg-card">{isRTL ? 'تدريب شخصي' : 'Personal Training'}</option>
                        <option value="online-coaching" className="bg-card">{isRTL ? 'تدريب أونلاين' : 'Online Coaching'}</option>
                        <option value="nutrition-planning" className="bg-card">{isRTL ? 'تخطيط التغذية' : 'Nutrition Planning'}</option>
                        <option value="body-transformation" className="bg-card">{isRTL ? 'تحويل الجسم' : 'Body Transformation'}</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{t('contact.form.messageLabel')}</label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={isRTL ? 'قولي عن أهدافك...' : 'Tell me about your fitness goals...'}
                      required
                      rows={5}
                      className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-red-600/50 focus:ring-red-600/20 resize-none"
                    />
                  </div>

                  {error && (
                    <p className="text-red-400 text-sm">{error}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 hover:shadow-red-600/40 transition-all duration-300 h-12 text-base"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className={`${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
                        {t('contact.form.sending')}
                      </>
                    ) : (
                      <>
                        <Send size={18} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {t('contact.form.send')}
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
