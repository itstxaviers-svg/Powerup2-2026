import { useCallback, useEffect, useRef, useState } from 'react'
import { AUDIO_TASK_AUTOPLAY_DELAY_MS, createAudioAutoplayOnceLifecycle, type AudioAutoplayOnceLifecycle } from './audioAutoplayOnce'

export const isDevelopmentSpeechSource = (source?: string) => source === 'dev-speech'
export const isBrowserSpeechSource = (source?: string) => source === 'browser-speech'
export const isAutoplayBlockedError = (error: unknown) => typeof error === 'object' && error !== null && 'name' in error && error.name === 'NotAllowedError'

let stopActivePlayback: (() => void) | null = null

export function useVocabularyAudio(source: string | undefined, spokenText: string, { autoPlayOnce = false, autoPlayDelayMs = AUDIO_TASK_AUTOPLAY_DELAY_MS }: { autoPlayOnce?: boolean; autoPlayDelayMs?: number } = {}) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const staticAudioFailedRef = useRef(false)
  const autoplayLifecycleRef = useRef<AudioAutoplayOnceLifecycle | null>(null)
  const mountedRef = useRef(true)
  const [playing, setPlaying] = useState(false)
  const [unavailable, setUnavailable] = useState(false)

  const stopCurrent = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.onended = null
      audio.onerror = null
      audio.pause()
      audio.currentTime = 0
      audioRef.current = null
    }
    if (utteranceRef.current && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      utteranceRef.current = null
    }
    if (stopActivePlayback === stopCurrent) stopActivePlayback = null
    if (mountedRef.current) setPlaying(false)
  }, [])

  useEffect(() => {
    mountedRef.current = true
    staticAudioFailedRef.current = false
    return () => {
      mountedRef.current = false
      stopCurrent()
    }
  }, [source, stopCurrent])

  const finish = useCallback((failed = false) => {
    if (!mountedRef.current) return
    if (stopActivePlayback === stopCurrent) stopActivePlayback = null
    setPlaying(false)
    setUnavailable(failed)
  }, [stopCurrent])

  const startBrowserSpeech = useCallback(() => {
    if (!('speechSynthesis' in window)) { finish(true); return }
    const utterance = new SpeechSynthesisUtterance(spokenText)
    utterance.lang = 'en-GB'
    utterance.onend = () => { utteranceRef.current = null; finish(false) }
    utterance.onerror = () => { utteranceRef.current = null; finish(true) }
    utteranceRef.current = utterance
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }, [finish, spokenText])

  const startPlayback = useCallback(() => {
    stopActivePlayback?.()
    setUnavailable(false)

    if (!source) { finish(true); return }
    setPlaying(true)
    stopActivePlayback = stopCurrent

    // Browser speech is the production fallback for supplied vocabulary that
    // does not yet have a recorded MP3. It stays inside the shared playback
    // lifecycle, so autoplay, Replay and cleanup behave like static audio.
    if (isDevelopmentSpeechSource(source) || isBrowserSpeechSource(source) || staticAudioFailedRef.current) {
      startBrowserSpeech()
      return
    }

    const audio = new Audio(source)
    audio.preload = 'auto'
    audio.muted = false
    audio.volume = 1
    audioRef.current = audio
    audio.onended = () => { audioRef.current = null; finish(false) }
    const fallbackToSpeech = () => {
      if (audioRef.current !== audio) return
      audio.onerror = null
      audio.pause()
      audioRef.current = null
      staticAudioFailedRef.current = true
      startBrowserSpeech()
    }
    audio.onerror = fallbackToSpeech
    void audio.play().catch((error: unknown) => {
      if (audioRef.current !== audio) return
      if (isAutoplayBlockedError(error)) {
        audio.pause()
        audioRef.current = null
        finish(false)
        return
      }
      fallbackToSpeech()
    })
  }, [finish, source, startBrowserSpeech, stopCurrent])

  const play = useCallback(() => {
    const lifecycle = autoplayLifecycleRef.current
    if (lifecycle) lifecycle.replayNow()
    else startPlayback()
  }, [startPlayback])

  useEffect(() => {
    if (!autoPlayOnce || typeof window === 'undefined' || typeof document === 'undefined') return

    const lifecycle = createAudioAutoplayOnceLifecycle({ play: startPlayback, stop: stopCurrent, delay: autoPlayDelayMs })
    autoplayLifecycleRef.current = lifecycle
    let pageLoaded = document.readyState === 'complete'

    const startWhenReady = () => {
      pageLoaded = true
      if (document.visibilityState !== 'hidden') lifecycle.start()
    }
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') lifecycle.pause()
      else if (pageLoaded) lifecycle.start()
    }

    if (pageLoaded) startWhenReady()
    else window.addEventListener('load', startWhenReady, { once: true })
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      window.removeEventListener('load', startWhenReady)
      document.removeEventListener('visibilitychange', handleVisibility)
      if (autoplayLifecycleRef.current === lifecycle) autoplayLifecycleRef.current = null
      lifecycle.dispose()
    }
  }, [autoPlayDelayMs, autoPlayOnce, source, spokenText, startPlayback, stopCurrent])

  return { play, stop: stopCurrent, playing, unavailable }
}
