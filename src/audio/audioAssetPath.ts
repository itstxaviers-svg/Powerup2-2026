const normalizedBaseUrl = (baseUrl: string) => {
  const withLeadingSlash = baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`
}

export const joinPublicAssetPath = (baseUrl: string, assetPath: string) =>
  `${normalizedBaseUrl(baseUrl)}${assetPath.replace(/^\/+/, '')}`

export const vocabularyAudioPath = (unitNumber: number, wordId: string) =>
  joinPublicAssetPath(import.meta.env.BASE_URL || '/', `assets/audio/unit-${String(unitNumber).padStart(2, '0')}/${wordId}.mp3`)
