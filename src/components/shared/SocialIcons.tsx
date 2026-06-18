'use client'

import { Instagram, Facebook, MessageCircle } from 'lucide-react'

const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/coach_connan?igsh=MTl5d3R6OG5hbjEzMQ==',
  whatsapp: 'https://wa.me/201119344441',
  facebook: 'https://www.facebook.com/share/1Gsw6HxmBS/?mibextid=wwXIfr',
}

interface SocialIconsProps {
  size?: number
  className?: string
  iconClassName?: string
  showLabels?: boolean
}

export default function SocialIcons({ size = 20, className = '', iconClassName = '', showLabels = false }: SocialIconsProps) {
  const icons = [
    {
      name: 'Instagram',
      icon: Instagram,
      href: SOCIAL_LINKS.instagram,
      color: 'hover:text-pink-500 hover:bg-pink-500/10',
      label: 'Follow on Instagram',
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      href: SOCIAL_LINKS.whatsapp,
      color: 'hover:text-green-500 hover:bg-green-500/10',
      label: 'Chat on WhatsApp',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      href: SOCIAL_LINKS.facebook,
      color: 'hover:text-blue-500 hover:bg-blue-500/10',
      label: 'Follow on Facebook',
    },
  ]

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {icons.map((item) => (
        <a
          key={item.name}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.label}
          className={`flex items-center gap-2 p-2.5 rounded-xl border border-white/10 text-muted-foreground transition-all duration-300 ${item.color} hover:border-white/20 hover:scale-110 ${iconClassName}`}
        >
          <item.icon size={size} />
          {showLabels && <span className="text-sm font-medium">{item.name}</span>}
        </a>
      ))}
    </div>
  )
}
