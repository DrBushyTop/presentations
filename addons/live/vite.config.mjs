import { livePlugin, onServerRefChanged } from './server/plugin.mjs'

export default {
  slidev: {
    serverRef: { onChanged: onServerRefChanged },
  },
  plugins: [livePlugin()],
}
