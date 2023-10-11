import type { Ref, UnwrapRef } from 'vue'
import { ref } from 'vue'

export interface FetchResult<T> {
    data: Ref<UnwrapRef<T | null>>;
    error: Ref<String | null>;
    loading: Ref<boolean>;
    isLoaded: Ref<boolean>;
    execute?: () => void;
}

export function useFetch<T>(url: string, option: RequestInit = {}): FetchResult<T> {
    const data = ref<T | null>(null)
    const error = ref<String | null>(null)
    const loading = ref<boolean>(true)
    const isLoaded = ref<boolean>(false)

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

    return { data, error, loading, isLoaded }
}


export function useFetchDelay<T>(url: string, option: RequestInit = {}): FetchResult<T> {
    const data = ref<T | null>(null)
    const error = ref<String | null>(null)
    const loading = ref<boolean>(true)
    const isLoaded = ref<boolean>(false)
    const execute = () => {
        fetch(url, option)
            .then(async (response) => {
                if (response.ok) {
                    try {
                        data.value = await response.json()
                    } catch (e) {
                        console.log(e)
                    }
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

    return { data, error, loading, isLoaded, execute }
}
