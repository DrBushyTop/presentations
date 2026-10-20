import { defineRootSetup } from '@slidev/types'
import { startBridge } from '../client/bridge'
import { startFollower } from '../client/follower'

declare const __SLIDEV_LIVE_VIEWER__: boolean
declare const __SLIDEV_LIVE_BRIDGE__: boolean

export default defineRootSetup(() => {
  if (__SLIDEV_LIVE_VIEWER__) startFollower()
  else if (__SLIDEV_LIVE_BRIDGE__) startBridge()
})
