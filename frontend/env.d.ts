/// <reference types="vite/client" />

/**
 * Add ethereum to the window object.
 */
interface Window {
  ethereum: any
}

// Make globalThis.BACKEND = 'localhost:8000' available.
declare const BACKEND: string

interface Layer8 {
  fetch(input: RequestInfo | URL, init?: RequestInit | undefined): Promise<Response>
}
// make globalThis.layer8 available.
declare const layer8: Layer8
