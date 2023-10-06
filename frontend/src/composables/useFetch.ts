import type { Ref, UnwrapRef } from 'vue'
import { ref } from 'vue'

interface FetchResult<T> {
  data: Ref<UnwrapRef<T | null>>;
  error: Ref<String | null>;
  loading: Ref<boolean>;
  isLoaded: Ref<boolean>;
}

export async function useFetch<T>(url: string, option: any = {}): Promise<FetchResult<T>> {
  const data = ref<T | null>(null)
  const error = ref<String | null>(null)
  const loading = ref<boolean>(false)
  const isLoaded = ref<boolean>(false)

  try {
    loading.value = true
    const response = await fetch(url, option)
    isLoaded.value = true
    if (response.ok) {
      data.value = await response.json()
    } else if (response.status >= 400 && response.status < 500) {
      error.value = `Client Error: ${response.status} - ${response.statusText}`
    } else {
      error.value = `Server Error: ${response.status} - ${response.statusText}`
    }
  } catch (err: any) {
    error.value = `Network Error: ${err.message}`
  } finally {
    loading.value = false
  }

  return { data, error, loading, isLoaded }
}
