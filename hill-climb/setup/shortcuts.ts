// Enter in the overview (o) goes to the slide number typed there. Slidev 53
// goes to the highlighted slide on Enter instead, and a single typed digit
// never moves the highlight, so slides 1 to 9 could not be reached by number.
import { defineShortcutsSetup } from '@slidev/types'
import { slides } from '@slidev/client/logic/slides.ts'
import { currentOverviewPage } from '@slidev/client/logic/overview.ts'
import { showOverview } from '@slidev/client/state/index.ts'
import { watch } from 'vue'

export default defineShortcutsSetup((nav, base) => {
  let typed = ''
  watch(showOverview, () => { typed = '' })
  addEventListener('keydown', (e) => {
    if (!showOverview.value || e.key === 'Enter') return
    if (!/^\d$/.test(e.key)) typed = ''
    else if (typed || e.key !== '0') typed = +(typed + e.key) > slides.value.length ? '' : typed + e.key
  }, { capture: true })

  return base.map(shortcut => shortcut.name !== 'goto_from_overview'
    ? shortcut
    : {
        ...shortcut,
        fn: () => {
          nav.go(typed ? +typed : currentOverviewPage.value)
          typed = ''
          showOverview.value = false
        },
      })
})
