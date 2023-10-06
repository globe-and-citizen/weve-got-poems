import type { Ref, UnwrapRef } from 'vue'
import { ref } from 'vue'

interface FetchResult<T> {
  data: Ref<UnwrapRef<T | null>>;
  error: Ref<String | null>;
  loading: Ref<boolean>;
  isLoaded: Ref<boolean>;
}

export function useFetch<T>(url: string, option: any = {}): FetchResult<T> {
  const data = ref<T | null>(null)
  const error = ref<String | null>(null)
  const loading = ref<boolean>(false)
  const isLoaded = ref<boolean>(false)

  loading.value = true
  fetch(url, option)
    .then(async (response) => {
      if (response.ok) {
        data.value = await response.json()
      } else if (response.status >= 400 && response.status < 500) {
        error.value = `Client Error: ${response.status} - ${response.statusText}`
      } else {
        error.value = `Server Error: ${response.status} - ${response.statusText}`
      }
    }).catch((err) => {
    error.value = `Network Error: ${err.message}`
  }).finally(() => {

    isLoaded.value = true
    loading.value = false
  })

  return { data, error, loading, isLoaded }
}
