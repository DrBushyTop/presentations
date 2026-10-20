import { defineVitePluginsSetup } from '@slidev/types'
import clickerPlugin from '../server/plugin.mjs'

export default defineVitePluginsSetup(options => [clickerPlugin(options)])
