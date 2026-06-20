export type FastDataOptions = {
  fast?: boolean
  timeoutMs?: number
}

const DEFAULT_FAST_TIMEOUT_MS = 1000

export async function withFastFallback<T>(
  promise: PromiseLike<any> | any,
  fallback: T,
  label: string,
  options: FastDataOptions = {}
): Promise<T> {
  if (!options.fast) return promise as Promise<T>

  let timeout: ReturnType<typeof setTimeout> | null = null
  let timedOut = false

  const guardedPromise = Promise.resolve(promise).catch((error) => {
    if (!timedOut) {
      console.error(`${label}:`, error)
    }

    return fallback
  })

  const timeoutPromise = new Promise<T>((resolve) => {
    timeout = setTimeout(() => {
      timedOut = true
      resolve(fallback)
    }, options.timeoutMs ?? DEFAULT_FAST_TIMEOUT_MS)
  })

  try {
    return await Promise.race([guardedPromise, timeoutPromise])
  } finally {
    if (timeout) clearTimeout(timeout)
  }
}
