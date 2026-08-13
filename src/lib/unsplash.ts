export async function fetchUnsplashPhoto(query: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/unsplash-photo?query=${encodeURIComponent(query)}`)
    const data = await res.json()
    return data.photoUrl ?? null
  } catch {
    return null
  }
}