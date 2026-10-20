import { defineAppSetup } from '@slidev/types'

declare const __SLIDEV_LIVE_BRIDGE__: boolean

// Only a dev server that publishes to the live site shares the presenter's
// Screen Mirror. Hooked here, before the presenter view can mount it.
export default defineAppSetup(async () => {
  if (import.meta.env.DEV && __SLIDEV_LIVE_BRIDGE__) (await import('../client/share')).startShare()
})
