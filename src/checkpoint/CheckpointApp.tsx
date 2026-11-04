import { useState, type FormEvent } from 'react'
import { unit1Vocabulary } from '../data/unit1Vocabulary'
import { unit2Vocabulary } from '../data/unit2Vocabulary'
import { unit3Vocabulary } from '../data/unit3Vocabulary'
import { FightingLevel } from '../games/fighting-level/FightingLevel'
import type { FightingLevelProgress, UnitData } from '../types/game'
import { checkpointReport } from './checkpointReport'
import { prepareFullCheckpointProgress, validCheckpointDraft, type CheckpointDraft } from './fullCheckpointProgress'

const PROFILE_KEY = 'powerup2-checkpoint1-profile-v1'
const PROGRESS_KEY = 'powerup2-checkpoint1-progress-v1'
const DRAFT_KEY = 'powerup2-checkpoint1-draft-v2'
const MILESTONE = 'after-unit-3' as const
const units: UnitData[] = [
  { id: 'unit-01', number: 1, title: 'Skyport Basics', words: unit1Vocabulary },
  { id: 'unit-02', number: 2, title: 'Clockwork City', words: unit2Vocabulary },
  { id: 'unit-03', number: 3, title: 'Garden of Words', words: unit3Vocabulary },
]

type Profile = { name: string; group: string; localId: string }
type Screen = 'home' | 'battle' | 'report' | 'settings'

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
    return prepareFullCheckpointProgress(saved, units, learner?.localId ?? 'checkpoint-one')
  })
  const [draft, setDraft] = useState<CheckpointDraft | null>(() => {
    const learner = stored<Profile>(PROFILE_KEY)
    const prepared = prepareFullCheckpointProgress(stored<FightingLevelProgress>(PROGRESS_KEY), units, learner?.localId ?? 'checkpoint-one')
    return validCheckpointDraft(stored<CheckpointDraft>(DRAFT_KEY), prepared)
  })
  const [screen, setScreen] = useState<Screen>('home')
  const [resetStep, setResetStep] = useState<0 | 1 | 2>(0)
  const [notice, setNotice] = useState('')
  const report = profile ? checkpointReport(profile.name, profile.group, progress, units) : ''

  const start = (event: FormEvent) => {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return
    const learner = { name: trimmedName, group: group.trim(), localId: profile?.localId ?? localId() }
    setProfile(learner)
    const prepared = prepareFullCheckpointProgress(progress, units, learner.localId)
    setProgress(prepared)
    const preparedDraft = validCheckpointDraft(draft, prepared)
    setDraft(preparedDraft)
    const profileSaved = save(PROFILE_KEY, learner)
    const progressSaved = save(PROGRESS_KEY, prepared)
    setNotice(profileSaved && progressSaved ? '' : 'Браузер запретил локальное сохранение. Не закрывайте страницу до отправки результата.')
    setScreen('battle')
  }

  const updateProgress = (next: FightingLevelProgress) => {
    setProgress(next)
    if (!save(PROGRESS_KEY, next)) setNotice('Не удалось сохранить результат на этом устройстве. Скопируйте отчёт до закрытия страницы.')
  }

  const updateDraft = (next: CheckpointDraft | null) => {
    setDraft(next)
    if (!save(DRAFT_KEY, next)) setNotice('Не удалось сохранить текущий этап на этом устройстве. Не закрывайте страницу до отправки результата.')
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

  const resetCheckpoint = () => {
    try {
      window.localStorage.removeItem(DRAFT_KEY)
      window.localStorage.removeItem(PROGRESS_KEY)
      window.localStorage.removeItem(PROFILE_KEY)
    } catch {
      setNotice('Не удалось удалить данные из браузера. Попробуйте ещё раз.')
      return
    }
    setProfile(null)
    setName('')
    setGroup('')
    setProgress(prepareFullCheckpointProgress(null, units, 'checkpoint-one'))
    setDraft(null)
    setResetStep(0)
    setNotice('Локальные данные Checkpoint удалены.')
    setScreen('home')
  }

  if (screen === 'battle' && profile) return <>
    <FightingLevel milestoneId={MILESTONE} allUnits={units} progress={progress} initialDraft={draft} onDraftChange={updateDraft} onProgressChange={updateProgress} onBack={() => setScreen('report')} onReport={() => setScreen('report')} />
    {notice && <p className="checkpoint-save-warning" role="alert">{notice}</p>}
  </>

  return <main className="checkpoint-shell">
    <div className="checkpoint-wrap">
      <header className="checkpoint-header"><p className="eyebrow">POWER UP 2 · UNITS 1–3</p><h1>Checkpoint 1</h1><p>Самостоятельная проверка без облака и аккаунта.</p><button className="checkpoint-settings-link" type="button" onClick={() => { setResetStep(0); setNotice(''); setScreen(screen === 'settings' ? 'home' : 'settings') }}>{screen === 'settings' ? '← Назад' : '⚙ Настройки'}</button></header>
      {screen === 'settings' ? <section className="checkpoint-panel" aria-labelledby="checkpoint-settings-heading">
        <p className="eyebrow">Локальные данные</p><h2 id="checkpoint-settings-heading">Настройки Checkpoint</h2>
        <p>Имя, ход проверки и результаты хранятся только в этом браузере. Удаление ниже требует двух подтверждений и не может быть отменено.</p>
        {resetStep === 0 ? <button className="checkpoint-danger" type="button" onClick={() => setResetStep(1)}>Удалить профиль и прогресс Checkpoint</button> : <div className="checkpoint-reset-confirm" role="alert"><strong>{resetStep === 1 ? 'Первое подтверждение: удалить все результаты и текущий ход?' : 'Последнее подтверждение: вернуть удалённые данные будет невозможно.'}</strong><div><button className="checkpoint-secondary" type="button" onClick={() => setResetStep(0)}>Отмена</button><button className="checkpoint-danger" type="button" onClick={() => resetStep === 1 ? setResetStep(2) : resetCheckpoint()}>{resetStep === 1 ? 'Да, продолжить' : 'Удалить данные сейчас'}</button></div></div>}
        {notice && <p className="checkpoint-notice" role="status">{notice}</p>}
      </section> : screen === 'report' && profile ? <section className="checkpoint-panel" aria-labelledby="checkpoint-report-heading">
        <p className="eyebrow">Отчёт для учителя</p>
        <h2 id="checkpoint-report-heading">{progress.completed ? 'Checkpoint пройден!' : 'Пока не пройден'}</h2>
        <p>{profile.name}{profile.group ? ` · ${profile.group}` : ''} · {progress.attemptHistory.length} {progress.attemptHistory.length === 1 ? 'попытка' : 'попыток'}</p>
        <p>Результат хранится только на этом устройстве. Скопируйте текст или скачайте файл и отправьте учителю.</p>
        <pre className="checkpoint-report-text">{report}</pre>
        <div className="checkpoint-actions"><button className="primary-button" type="button" onClick={copyReport}>Скопировать отчёт</button><button className="checkpoint-secondary" type="button" onClick={downloadReport}>Скачать .txt</button><button className="checkpoint-secondary" type="button" onClick={() => setScreen('battle')}>{draft?.taskIndex ? `Продолжить с вопроса ${draft.taskIndex + 1}` : 'Повторить бой'}</button></div>
        {notice && <p className="checkpoint-notice" role="status">{notice}</p>}
      </section> : <section className="checkpoint-panel" aria-labelledby="checkpoint-start-heading">
        <p className="eyebrow">The Inkbound Knight</p><h2 id="checkpoint-start-heading">Проверь слова трёх юнитов</h2>
        <p>Все 134 слова юнитов 1–3 в случайном порядке: задания с картинками и аудио. На ответ — 10 секунд; для победы нужно не менее 114 правильных ответов. После каждого вопроса ход сохраняется на этом устройстве. В конце получите отчёт с ошибками и номером попытки.</p>
        <form className="checkpoint-form" onSubmit={start}>
          <label>Имя ученика<input value={name} onChange={(event) => setName(event.target.value)} required maxLength={80} autoComplete="name" placeholder="Имя и фамилия" /></label>
          <label>Группа / класс (необязательно)<input value={group} onChange={(event) => setGroup(event.target.value)} maxLength={80} placeholder="Например, 5А" /></label>
          <button className="primary-button" type="submit">{draft?.taskIndex ? `Продолжить с вопроса ${draft.taskIndex + 1} →` : progress.attemptHistory.length ? 'Новая попытка →' : 'Начать Checkpoint →'}</button>
        </form>
        {progress.attemptHistory.length > 0 && <button className="checkpoint-secondary" type="button" onClick={() => setScreen('report')}>Посмотреть сохранённый отчёт</button>}
        <p className="checkpoint-privacy">Данные остаются в браузере. Не очищайте данные сайта, пока не отправите результат учителю.</p>
        {notice && <p className="checkpoint-notice" role="status">{notice}</p>}
      </section>}
    </div>
  </main>
}
