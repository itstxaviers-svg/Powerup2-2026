import { useState, type FormEvent } from 'react'
import { unit1Vocabulary } from '../data/unit1Vocabulary'
import { unit2Vocabulary } from '../data/unit2Vocabulary'
import { unit3Vocabulary } from '../data/unit3Vocabulary'
import { FightingLevel } from '../games/fighting-level/FightingLevel'
import { blankFightingLevelProgress, fightingSeed, prepareFightingLevelProgress } from '../games/fighting-level/fightingLevelEngine'
import type { FightingLevelProgress, UnitData } from '../types/game'
import { checkpointReport } from './checkpointReport'

const PROFILE_KEY = 'powerup2-checkpoint1-profile-v1'
const PROGRESS_KEY = 'powerup2-checkpoint1-progress-v1'
const MILESTONE = 'after-unit-3' as const
const units: UnitData[] = [
  { id: 'unit-01', number: 1, title: 'Skyport Basics', words: unit1Vocabulary },
  { id: 'unit-02', number: 2, title: 'Clockwork City', words: unit2Vocabulary },
  { id: 'unit-03', number: 3, title: 'Garden of Words', words: unit3Vocabulary },
]

type Profile = { name: string; group: string; localId: string }
type Screen = 'home' | 'battle' | 'report'

function stored<T>(key: string): T | null {
  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) as T : null
  } catch { return null }
}

function save(key: string, value: unknown): boolean {
  try { window.localStorage.setItem(key, JSON.stringify(value)); return true }
  catch { return false }
}

function localId(): string {
  return typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
}

export function CheckpointApp() {
  const [profile, setProfile] = useState<Profile | null>(() => stored<Profile>(PROFILE_KEY))
  const [name, setName] = useState(() => stored<Profile>(PROFILE_KEY)?.name ?? '')
  const [group, setGroup] = useState(() => stored<Profile>(PROFILE_KEY)?.group ?? '')
  const [progress, setProgress] = useState<FightingLevelProgress>(() => {
    const saved = stored<FightingLevelProgress>(PROGRESS_KEY)
    const learner = stored<Profile>(PROFILE_KEY)
    return prepareFightingLevelProgress(saved ?? blankFightingLevelProgress(MILESTONE), units, MILESTONE, fightingSeed(learner?.localId ?? 'checkpoint-one'))
  })
  const [screen, setScreen] = useState<Screen>('home')
  const [notice, setNotice] = useState('')
  const report = profile ? checkpointReport(profile.name, profile.group, progress, units) : ''

  const start = (event: FormEvent) => {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return
    const learner = { name: trimmedName, group: group.trim(), localId: profile?.localId ?? localId() }
    setProfile(learner)
    const prepared = prepareFightingLevelProgress(progress, units, MILESTONE, fightingSeed(learner.localId))
    setProgress(prepared)
    const profileSaved = save(PROFILE_KEY, learner)
    const progressSaved = save(PROGRESS_KEY, prepared)
    setNotice(profileSaved && progressSaved ? '' : 'Браузер запретил локальное сохранение. Не закрывайте страницу до отправки результата.')
    setScreen('battle')
  }

  const updateProgress = (next: FightingLevelProgress) => {
    setProgress(next)
    if (!save(PROGRESS_KEY, next)) setNotice('Не удалось сохранить результат на этом устройстве. Скопируйте отчёт до закрытия страницы.')
  }

  const copyReport = async () => {
    try { await navigator.clipboard.writeText(report); setNotice('Отчёт скопирован. Отправьте его учителю.') }
    catch { setNotice('Копирование недоступно. Сделайте скриншот отчёта или скачайте файл.') }
  }

  const downloadReport = () => {
    const url = URL.createObjectURL(new Blob([report], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'power-up-2-checkpoint-1-result.txt'
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  if (screen === 'battle' && profile) return <>
    <FightingLevel milestoneId={MILESTONE} allUnits={units} progress={progress} onProgressChange={updateProgress} onBack={() => setScreen('report')} onReport={() => setScreen('report')} />
    {notice && <p className="checkpoint-save-warning" role="alert">{notice}</p>}
  </>

  return <main className="checkpoint-shell">
    <div className="checkpoint-wrap">
      <header className="checkpoint-header"><p className="eyebrow">POWER UP 2 · UNITS 1–3</p><h1>Checkpoint 1</h1><p>Самостоятельная проверка без облака и аккаунта.</p></header>
      {screen === 'report' && profile ? <section className="checkpoint-panel" aria-labelledby="checkpoint-report-heading">
        <p className="eyebrow">Отчёт для учителя</p>
        <h2 id="checkpoint-report-heading">{progress.completed ? 'Checkpoint пройден!' : 'Пока не пройден'}</h2>
        <p>{profile.name}{profile.group ? ` · ${profile.group}` : ''} · {progress.attemptHistory.length} {progress.attemptHistory.length === 1 ? 'попытка' : 'попыток'}</p>
        <p>Результат хранится только на этом устройстве. Скопируйте текст или скачайте файл и отправьте учителю.</p>
        <pre className="checkpoint-report-text">{report}</pre>
        <div className="checkpoint-actions"><button className="primary-button" type="button" onClick={copyReport}>Скопировать отчёт</button><button className="checkpoint-secondary" type="button" onClick={downloadReport}>Скачать .txt</button><button className="checkpoint-secondary" type="button" onClick={() => setScreen('battle')}>Повторить бой</button></div>
        {notice && <p className="checkpoint-notice" role="status">{notice}</p>}
      </section> : <section className="checkpoint-panel" aria-labelledby="checkpoint-start-heading">
        <p className="eyebrow">The Inkbound Knight</p><h2 id="checkpoint-start-heading">Проверь слова трёх юнитов</h2>
        <p>Задания с картинками и аудио. На ответ — 10 секунд; для победы нужно не менее 85% правильных ответов. После боя получите отчёт с ошибками и номером попытки.</p>
        <form className="checkpoint-form" onSubmit={start}>
          <label>Имя ученика<input value={name} onChange={(event) => setName(event.target.value)} required maxLength={80} autoComplete="name" placeholder="Имя и фамилия" /></label>
          <label>Группа / класс (необязательно)<input value={group} onChange={(event) => setGroup(event.target.value)} maxLength={80} placeholder="Например, 5А" /></label>
          <button className="primary-button" type="submit">{progress.attemptHistory.length ? 'Продолжить Checkpoint →' : 'Начать Checkpoint →'}</button>
        </form>
        {progress.attemptHistory.length > 0 && <button className="checkpoint-secondary" type="button" onClick={() => setScreen('report')}>Посмотреть сохранённый отчёт</button>}
        <p className="checkpoint-privacy">Данные остаются в браузере. Не очищайте данные сайта, пока не отправите результат учителю.</p>
        {notice && <p className="checkpoint-notice" role="status">{notice}</p>}
      </section>}
    </div>
  </main>
}
