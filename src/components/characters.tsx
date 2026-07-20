import type { ReactNode } from 'react'

export function MessengerCharacter({ variant = 'moss', size = 'medium', mood = 'quiet', color }: { variant?: 'moss' | 'cloud' | 'ember' | 'pebble'; size?: 'small' | 'medium' | 'large'; mood?: 'quiet' | 'carrying' | 'happy'; color?: string }) {
  return <div className={`messenger ${variant} ${size} ${mood}`} style={color ? { background: color } : undefined} role="img" aria-label="柔软的记忆信使"><span className="eye left" /><span className="eye right" />{mood === 'carrying' && <span className="tiny-letter">✉</span>}</div>
}

export function MistScene({ children }: { children?: ReactNode }) {
  return <div className="mist-scene" aria-hidden={!children}><span className="hill hill-one" /><span className="hill hill-two" /><span className="soft-tree tree-one" /><span className="soft-tree tree-two" /><span className="path-line" /><div className="scene-characters"><MessengerCharacter variant="moss" size="small" /><MessengerCharacter variant="cloud" size="small" /></div>{children}</div>
}

export function StoryIllustration({ variant = 0, label = '叙事插图' }: { variant?: number; label?: string }) {
  return <div className={`story-illustration illustration-${variant % 4}`} role="img" aria-label={label}><span className="illustration-moon" /><span className="illustration-house" /><span className="illustration-light" /><span className="illustration-ground" /></div>
}

export function StoryPhoto({ src, alt, caption, eager = false }: { src: string; alt: string; caption?: string; eager?: boolean }) {
  return <figure className="story-photo"><img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} />{caption && <figcaption>{caption}</figcaption>}</figure>
}
