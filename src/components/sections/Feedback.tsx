'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Star, MessageSquare, Send, Loader2, CheckCircle2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import SectionHeading from '@/components/shared/SectionHeading'
import { useLanguage } from '@/contexts/LanguageContext'

interface FeedbackItem {
  id: string
  name: string
  rating: number
  comment: string
  createdAt: string
}

export default function Feedback() {
  const { t, lang } = useLanguage()
  const isRTL = lang === 'ar'

  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hoverRating, setHoverRating] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    rating: 0,
    comment: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const fetchFeedback = useCallback(async () => {
    try {
      const response = await fetch('/api/feedback')
      if (response.ok) {
        const data = await response.json()
        setFeedbackList(data.feedback || data || [])
      }
    } catch {
      // Silently handle - feedback list is non-critical
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFeedback()
  }, [fetchFeedback])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.rating === 0) return

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          rating: formData.rating,
          comment: formData.comment,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Something went wrong')
      }

      setIsSuccess(true)
      setFormData({ name: '', rating: 0, comment: '' })
      setHoverRating(0)
      setTimeout(() => setIsSuccess(false), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <section id="feedback" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full section-divider" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-red-950/3 to-background" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-red-600/3 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-orange-600/3 rounded-full blur-[100px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title={t('feedback.title')}
          subtitle={t('feedback.subtitle')}
        />

        <div className="grid lg:grid-cols-2 gap-8 mt-16">
          {/* Left - Feedback Form */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
            whileInView={{ x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="glass rounded-3xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center">
                  <MessageSquare size={20} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {t('feedback.title')}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t('feedback.subtitle')}
                  </p>
                </div>
              </div>

              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12 space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-green-600/20 border border-green-600/30 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={32} className="text-green-500" />
                  </div>
                  <h4 className="text-lg font-bold text-white">
                    {t('feedback.success')}
                  </h4>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {t('feedback.name')}
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder={isRTL ? 'اسمك' : 'Your name'}
                      required
                      className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-red-600/50 focus:ring-red-600/20"
                    />
                  </div>

                  {/* Star Rating */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {t('feedback.rating')}
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, rating: star })
                          }
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 transition-transform hover:scale-110 focus:outline-none"
                          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                        >
                          <Star
                            size={28}
                            className={`transition-colors duration-150 ${
                              star <= (hoverRating || formData.rating)
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-white/20 hover:text-yellow-500/50'
                            }`}
                          />
                        </button>
                      ))}
                      {formData.rating > 0 && (
                        <Badge
                          variant="secondary"
                          className="ml-2 bg-red-600/20 text-red-400 border border-red-600/30"
                        >
                          {formData.rating}/5
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {t('feedback.comment')}
                    </label>
                    <Textarea
                      value={formData.comment}
                      onChange={(e) =>
                        setFormData({ ...formData, comment: e.target.value })
                      }
                      placeholder={
                        isRTL
                          ? 'شاركنا تجربتك...'
                          : 'Share your experience...'
                      }
                      required
                      rows={4}
                      className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-red-600/50 focus:ring-red-600/20 resize-none"
                    />
                  </div>

                  {error && <p className="text-red-400 text-sm">{error}</p>}

                  <Button
                    type="submit"
                    disabled={isSubmitting || formData.rating === 0}
                    className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 hover:shadow-red-600/40 transition-all duration-300 h-12 text-base disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2
                          size={18}
                          className={`${isRTL ? 'ml-2' : 'mr-2'} animate-spin`}
                        />
                        {t('feedback.submitting')}
                      </>
                    ) : (
                      <>
                        <Send
                          size={18}
                          className={`${isRTL ? 'ml-2' : 'mr-2'}`}
                        />
                        {t('feedback.submit')}
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>

          {/* Right - Approved Feedback List */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
            whileInView={{ x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="glass rounded-3xl p-6 md:p-8 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center">
                  <Star size={20} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {t('feedback.recentFeedback')}
                  </h3>
                  {!isLoading && (
                    <p className="text-xs text-muted-foreground">
                      {feedbackList.length}{' '}
                      {isRTL ? 'تقييم' : 'reviews'}
                    </p>
                  )}
                </div>
              </div>

              {/* Feedback Items */}
              <div className="flex-1 max-h-[500px] overflow-y-auto space-y-4 pr-1">
                {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 size={24} className="animate-spin text-red-500" />
                  </div>
                ) : feedbackList.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                      <MessageSquare size={24} className="text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {t('feedback.noFeedback')}
                    </p>
                  </div>
                ) : (
                  feedbackList.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ y: 0 }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 hover:border-red-600/20 transition-all duration-300 group"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-red-600/20 border border-red-600/30 flex items-center justify-center">
                            <User size={14} className="text-red-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {item.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(item.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={
                                i < item.rating
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-white/10'
                              }
                            />
                          ))}
                        </div>
                      </div>
                      {/* Comment */}
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.comment}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
