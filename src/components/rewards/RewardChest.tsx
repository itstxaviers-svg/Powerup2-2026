import { useState } from 'react'
import { assets } from '../../data/assets'
import type { ChestTier, RewardDefinition } from '../../data/rewards'
import { useEnterAction } from '../../games/useEnterAction'

const tierIndex: Record<ChestTier, number> = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4, mythic: 5 }

// Coordinates are measured from the centres of the individual illustrations in
// the 1448 × 1086 composite. The 128 px crop excludes the sheet's printed labels.
const rewardCropCenters: Record<string, { x: number; y: number }> = {
  'word-master': { x: 543, y: 604 },
  'error-hunter': { x: 638, y: 604 },
  'audio-expert': { x: 732, y: 604 },
  'strike-champion': { x: 826, y: 604 },
  'code-fighter': { x: 921, y: 604 },
  'star-key': { x: 72, y: 604 },
  'engine-key': { x: 166, y: 604 },
  'garden-key': { x: 259, y: 604 },
  'dreamspire-key': { x: 353, y: 604 },
  'citadel-key': { x: 447, y: 604 },
  'star-coins': { x: 1015, y: 604 },
  'artifact-token': { x: 1178, y: 604 },
  'light-shard': { x: 1260, y: 604 },
  goggles: { x: 72, y: 836 },
  scarf: { x: 166, y: 836 },
  hat: { x: 259, y: 836 },
  'back-gear': { x: 353, y: 836 },
  pendant: { x: 447, y: 836 },
  'crystal-fountain': { x: 1260, y: 843 },
}

function cropPosition(icon: string) {
  const center = rewardCropCenters[icon] ?? rewardCropCenters['star-coins']
  return `${(center.x - 64) / 1320 * 100}% ${(center.y - 64) / 958 * 100}%`
}

export function RewardIcon({ reward }: { reward: RewardDefinition }) {
  return <div className={`reward-item-icon icon-${reward.icon}`} style={{ backgroundImage: `url(${assets.rewardSetSheet})`, backgroundPosition: cropPosition(reward.icon) }} aria-hidden="true" />
}

export function UnitCompletionFlow({ unitTitle, tier, rewards, onClaim, onContinue }: { unitTitle: string; tier: ChestTier; rewards: RewardDefinition[]; onClaim: () => void; onContinue: () => void }) {
  const [step, setStep] = useState<'restored' | 'chest' | 'reveal'>('restored')
  const open = () => { onClaim(); setStep('reveal') }
  const advance = step === 'restored' ? () => setStep('chest') : step === 'chest' ? open : onContinue
  useEnterAction(advance)
  return <div className="completion-overlay" role="dialog" aria-modal="true" aria-labelledby="completion-title">
    <section className={`completion-card step-${step}`}>
      {step === 'restored' && <><div className="restoration-burst" aria-hidden="true">✦</div><p className="eyebrow">City fully activated</p><h1 id="completion-title">{unitTitle} restored!</h1><p>All five power stations are online. Your learning has brought this city back to life.</p><button className="primary-button" type="button" onClick={() => setStep('chest')} aria-keyshortcuts="Enter" data-enter-action>Reveal reward chest →</button></>}
      {step === 'chest' && <><p className="eyebrow">{tier} completion chest</p><h1 id="completion-title">A reward is waiting</h1><ChestArt tier={tier} state="ready" /><button className="primary-button" type="button" onClick={open} aria-keyshortcuts="Enter" data-enter-action>Open chest</button><button className="text-button" type="button" onClick={open}>Skip animation and reveal</button></>}
      {step === 'reveal' && <><p className="eyebrow">Rewards collected</p><h1 id="completion-title">Lightworld treasure</h1><ChestArt tier={tier} state="opened" /><div className="reward-reveal-grid">{rewards.map((reward) => <div className="reward-reveal" key={reward.id}><RewardIcon reward={reward} /><strong>{reward.label}</strong><span>×{reward.quantity}</span></div>)}</div><button className="primary-button" type="button" onClick={onContinue} aria-keyshortcuts="Enter" data-enter-action>Continue to the world →</button></>}
    </section>
  </div>
}

export function ChestArt({ tier, state = 'ready' }: { tier: ChestTier; state?: 'ready' | 'opened' }) {
  return <div className={`chest-art tier-${tier} ${state}`} style={{ backgroundImage: `url(${assets.rewardChestSheet})`, backgroundPosition: `${tierIndex[tier] * 20}% 100%` }} role="img" aria-label={`${tier} reward chest, ${state}`} />
}
