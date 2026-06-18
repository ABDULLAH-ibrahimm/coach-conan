'use client'

import { ReactNode } from 'react'

interface SectionHeadingProps {
  title: string
  subtitle: string
  align?: 'center' | 'left'
  children?: ReactNode
}

export default function SectionHeading({ title, subtitle, align = 'center', children }: SectionHeadingProps) {
  return (
    <div className={`mb-12 ${align === 'center' ? 'text-center' : 'text-left'}`}>
      <p className="text-red-500 font-semibold text-sm uppercase tracking-[0.2em] mb-3">{subtitle}</p>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
        {title.split(' ').map((word, i) => (
          i === title.split(' ').length - 1 ? (
            <span key={i} className="gradient-text">{word}</span>
          ) : (
            <span key={i}>{word} </span>
          )
        ))}
      </h2>
      <div className={`h-1 w-20 bg-gradient-to-r from-red-600 to-orange-500 rounded-full ${align === 'center' ? 'mx-auto' : ''}`} />
      {children && <div className="mt-4 text-muted-foreground max-w-2xl mx-auto">{children}</div>}
    </div>
  )
}
