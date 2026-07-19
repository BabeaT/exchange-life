import { Mail } from 'lucide-react'
import { MessengerCharacter } from '../components/characters'
import type { DemoUser } from '../types'

export function DeliveryAnimation({ arrived, reduced, messenger }: { arrived: boolean; reduced: boolean; messenger: DemoUser['messenger'] }) {
  return <div className={`delivery-animation ${arrived ? 'arrived' : ''} ${reduced ? 'reduced' : ''}`} aria-label="记忆信使带着信封抵达"><span className="delivery-ground" /><div className="delivery-character"><MessengerCharacter variant={messenger} size="large" mood="carrying" /></div><div className="delivered-envelope"><Mail size={28} /><span>给你的一封信</span></div></div>
}
