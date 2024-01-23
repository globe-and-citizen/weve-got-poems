/// <reference types="vite/client" />

/**
 * Add ethereum to the window object.
 */
interface Window {
  ethereum: any
}

/**
 * Add layer8 to the globalThis object.
 */
interface Layer8 {
  fetch(input: RequestInfo | URL, init?: RequestInit | undefined): Promise<Response>
}
// make globalThis.layer8 available.
declare const layer8: Layer8
