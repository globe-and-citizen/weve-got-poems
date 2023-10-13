import type { Ref, UnwrapRef } from 'vue'
import { onMounted, ref } from 'vue'

export interface FetchResult<T> {
  data: Ref<UnwrapRef<T | null>>;
  error: Ref<String | null>;
  loading: Ref<boolean>;
  isLoaded: Ref<boolean>;
  execute: () => void;
}

interface UseFetchOptions {
  /**
   * Will automatically run fetch when `useFetch` is used
   *
   * @default true
   */
  immediate?: boolean;
  /**
   * Will automatically refetch when:
   * - the URL is changed if the URL is a ref
   * - the payload is changed if the payload is a ref
   *
   * @default false
   */
  refetch?: boolean
}

export function useFetch<T>(url: string, option: RequestInit = {}, useFetchOptions: UseFetchOptions = { immediate: true, refetch: true }): FetchResult<T> {
  const data = ref<T | null>(null)
  const error = ref<String | null>(null)
  const loading = ref<boolean>(true)
  const isLoaded = ref<boolean>(false)

  const execute = () => {
    // Initiate the fetch result to null
    data.value = null
    error.value = null
    loading.value = true
    isLoaded.value = false

    fetch(url, option)
      .then(async (response) => {
        if (response.ok) {
          data.value = await response.json()
        } else if (response.status >= 400 && response.status < 500) {
          error.value = `Client Error: ${response.status} - ${response.statusText}`
        } else {
          error.value = `Server Error: ${response.status} - ${response.statusText}`
        }
      })
      .catch((err) => {
        error.value = `Network Error: ${err.message}`
      })
      .finally(() => {
        isLoaded.value = true
        loading.value = false
      })
  }

  onMounted(() => {
    if (useFetchOptions?.immediate) {
      execute()
    }
  })

  // TODO: implement for reactivity
  // Execute fetchData when the URL or option changes
  // watch([urlRef, optionRef], execute, { immediate: true });

  return { data, error, loading, isLoaded, execute }
}

