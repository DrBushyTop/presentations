import { defineVitePluginsSetup } from '@slidev/types'
import t3AnnotatePlugin from '../server/plugin.mjs'

export default defineVitePluginsSetup((options) => [t3AnnotatePlugin(options)])
