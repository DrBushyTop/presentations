import { defineVitePluginsSetup } from '@slidev/types'

// Viewer builds get settings the CLI cannot override: `--no-download` loses
// to `download: true` in a deck's headmatter, and there is no flag for the
// context menu. Change them before the build reads them.
export default defineVitePluginsSetup((options) => {
  if (process.env.SLIDEV_LIVE_VIEWER === '1') {
    options.data.config.download = false
    options.data.config.contextMenu = false
  }
  return []
})
