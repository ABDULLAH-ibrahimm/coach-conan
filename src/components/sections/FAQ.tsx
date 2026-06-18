'use client'

import { motion } from 'framer-motion'
import { MessageCircleQuestion } from 'lucide-react'
import SectionHeading from '@/components/shared/SectionHeading'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useLanguage } from '@/contexts/LanguageContext'

const FAQ_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'] as const

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

export default function FAQ() {
  const { t } = useLanguage()

  return (
    <section id="faq" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full section-divider" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-red-950/3 to-background" />
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-red-600/3 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] bg-red-600/5 rounded-full blur-[120px]" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title={t('faq.title')}
          subtitle={t('faq.subtitle')}
        >
          <p className="text-muted-foreground mt-4">
            {t('faq.desc')}
          </p>
        </SectionHeading>

        {/* FAQ Accordion */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {FAQ_KEYS.map((key, index) => (
              <motion.div key={key} variants={itemVariants}>
                <AccordionItem
                  value={`item-${index}`}
                  className="glass rounded-xl px-6 border-0 data-[state=open]:border-red-600/20 data-[state=open]:red-glow transition-all duration-300"
                >
                  <AccordionTrigger className="text-left text-base md:text-lg font-semibold text-white hover:text-red-400 hover:no-underline py-5 transition-colors [&>svg]:text-red-500">
                    <span className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-500 text-sm font-bold">
                        {index + 1}
                      </span>
                      <span>{t(`faq.${key}`)}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-sm md:text-base pb-5">
                    <div className="ps-11">
                      {t(`faq.a${index + 1}`)}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ y: 0 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="glass rounded-2xl p-8 md:p-10 inline-block w-full">
            <MessageCircleQuestion className="w-10 h-10 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
              {t('faq.cta.title')}
            </h3>
            <p className="text-muted-foreground mb-6 text-sm md:text-base">
              {t('faq.desc')}
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-600/25"
            >
              {t('faq.cta.button')}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
