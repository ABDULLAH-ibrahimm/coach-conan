'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Quote, ChevronLeft, ChevronRight, User } from 'lucide-react'
import SectionHeading from '@/components/shared/SectionHeading'
import { useLanguage } from '@/contexts/LanguageContext'

const TESTIMONIALS_EN = [
  {
    name: 'Ahmed Hassan',
    role: 'Lost 25kg in 4 months',
    text: "Honestly didn't expect this. 25kg in 4 months training from home. The program was clear and simple to follow. Conan was always available whenever I needed him.",
    rating: 5,
  },
  {
    name: 'Sara Mohamed',
    role: 'Gained muscle & confidence',
    text: "I never liked the gym and was nervous to start. Conan explained everything patiently and made a program that actually worked for me. Now I can't stop.",
    rating: 5,
  },
  {
    name: 'Omar Youssef',
    role: 'Broke through a plateau',
    text: "Been training for years but my progress stopped. Conan adjusted my training and diet and I saw results within a month. He genuinely knows what he's doing.",
    rating: 5,
  },
  {
    name: 'Mariam Khaled',
    role: 'Post-pregnancy transformation',
    text: "After my second baby I didn't think I'd get back in shape. Conan built a plan around my situation and we started slow. Three months later I'm in better shape than before.",
    rating: 5,
  },
  {
    name: 'Karim El-Sayed',
    role: 'Online coaching from Dubai',
    text: "I'm based in Dubai and was worried online coaching wouldn't be the same. But Conan is always on WhatsApp and checks in every week. Felt like having a coach right there.",
    rating: 5,
  },
  {
    name: 'Nourhan Ali',
    role: 'Lost 18kg in 3 months',
    text: "The diet he gave me wasn't about starving myself. He built a plan around my body type and I didn't feel like I was suffering. The weight just came off naturally.",
    rating: 5,
  },
]

const TESTIMONIALS_AR = [
  {
    name: 'أحمد حسن',
    role: 'خسّر 25 كجم في 4 شهور',
    text: 'والله مكنتش متوقع كده. 25 كيلو في 4 شهور وأنا من بيتي. البرنامج واضح ومش معقد. كونان رد عليّا في كل وقت محتاجه.',
    rating: 5,
  },
  {
    name: 'سارة محمد',
    role: 'اكتسبت عضلات وثقة',
    text: 'أنا أصلاً مش بحب الجيم وكنت خايفة أبدأ. بس كونان شرحلي كل حاجة بهدوء وعمل لي برنامج يناسبني. دلوقتي مش قادرة أوقف.',
    rating: 5,
  },
  {
    name: 'عمر يوسف',
    role: 'كسر مرحلة الثبات',
    text: 'كنت بتمرن من سنين بس الأوزان وقفت. كونان غيّرلي التمرين والأكل وشفت فرق في شهر. فاهم هو بيعمل إيه.',
    rating: 5,
  },
  {
    name: 'مريم خالد',
    role: 'تحول بعد الحمل',
    text: 'بعد ثاني ولادة قلت مش هرجع تاني. بس كونان عمل برنامج يناسب وضعي وبدأنا ببطء. في 3 شهور رجعت أحسن من الأول.',
    rating: 5,
  },
  {
    name: 'كريم السيد',
    role: 'تدريب أونلاين من دبي',
    text: 'أنا في دبي وكنت خايف التدريب الأونلاين ميكونش زي الشخصي. بس كونان دايمًا على الواتساب وبيفولو معايا كل أسبوع. حسيت إنه جنبي فعلاً.',
    rating: 5,
  },
  {
    name: 'نورهان علي',
    role: 'خسّرت 18 كجم في 3 شهور',
    text: 'الدايت اللي بعته مش عن الجوع. عمل لي خطة أكل حسب جسمي ومكنتش بحس بأي تعب. الوزن نزل من غير ما أحس.',
    rating: 5,
  },
]

export default function Testimonials() {
  const { t, lang } = useLanguage()
  const isRTL = lang === 'ar'
  const TESTIMONIALS = isRTL ? TESTIMONIALS_AR : TESTIMONIALS_EN

  const [currentIndex, setCurrentIndex] = useState(0)
  const visibleCount = 3
  const pageCount = Math.ceil(TESTIMONIALS.length / visibleCount)
  const maxIndex = pageCount - 1

  const next = () => setCurrentIndex((prev) => Math.min(prev + 1, maxIndex))
  const prev = () => setCurrentIndex((prev) => Math.max(prev - 1, 0))

  return (
    <section id="testimonials" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full section-divider" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-red-950/3 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/3 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title={t('testimonials.title')}
          subtitle={t('testimonials.subtitle')}
        >
          <p className="text-muted-foreground mt-4">
            {t('testimonials.desc')}
          </p>
        </SectionHeading>

        {/* Navigation */}
        <div className="flex justify-end gap-2 mb-8">
          <button
            onClick={isRTL ? next : prev}
            disabled={isRTL ? currentIndex === maxIndex : currentIndex === 0}
            className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-muted-foreground hover:text-white hover:border-red-600/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Previous testimonials"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={isRTL ? prev : next}
            disabled={isRTL ? currentIndex === 0 : currentIndex === maxIndex}
            className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-muted-foreground hover:text-white hover:border-red-600/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Next testimonials"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Testimonials Carousel */}
        <div className="overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ x: 0 }}
              animate={{ x: 0 }}
              exit={{ x: -30 }}
              transition={{ duration: 0.4 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {TESTIMONIALS.slice(currentIndex * visibleCount, (currentIndex + 1) * visibleCount).map((testimonial) => (
                <div
                  key={testimonial.name}
                  className="glass rounded-2xl p-6 hover:border-red-600/30 transition-all duration-300 group relative"
                >
                  <Quote className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} w-8 h-8 text-red-600/10`} />
                  
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} size={14} className="text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>

                  {/* Text */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    <div className="w-10 h-10 rounded-full bg-red-600/20 border border-red-600/30 flex items-center justify-center">
                      <User size={16} className="text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{testimonial.name}</p>
                      <p className="text-xs text-red-400">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === currentIndex ? 'w-6 bg-red-600' : 'bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
