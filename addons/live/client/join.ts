// The way into the talk, in the middle of the screen. Browsers only play sound
// once the viewer has touched the page, so while that is still needed the
// card offers a Join button, and that click turns the sound on. A talk with a
// password asks for it here too: `?password=` in the link fills it in, and the
// viewer still clicks Join. The relay checks the password; this page only
// keeps the key made from it, for this tab.
import { buildCard, takeLinkPassword } from '../site/card.js'
import { derive } from '../site/derive.js'

declare const __SLIDEV_LIVE_DECK__: string

const KEY = 'slidev-live-key'

// The key the relay asks for. The SHA-256 of it is the lock `npm run live`
// set. A sealed site's unlock page (site/unlock.js) stores it here before the
// app starts.
export async function keyFor(password: string) {
  return (await derive(password, __SLIDEV_LIVE_DECK__)).relay
}

export function storedKey() {
  try {
    return sessionStorage.getItem(KEY) ?? ''
  }
  catch {
    return ''
  }
}

function storeKey(key: string) {
  try {
    if (key) sessionStorage.setItem(KEY, key)
    else sessionStorage.removeItem(KEY)
  }
  catch {}
}

export function createJoin(onKey: (key: string) => void) {
  const given = takeLinkPassword()
  const { backdrop, form, field, input, error, go } = buildCard()
  input.value = given

  // `locked`: the relay wants a password. `sound`: the browser still needs a
  // touch before it plays sound. `live`: a talk is on stage, so there is
  // something to join.
  let locked = false
  let wrong = false
  let checking = false
  let sound = false
  let live = false
  let joined = false

  function render() {
    const asking = locked && !checking
    backdrop.hidden = !(locked || (sound && live && !joined))
    field.hidden = !locked
    error.hidden = !(asking && wrong)
    error.textContent = wrong ? 'That password didn\'t work. Try again.' : ''
    go.disabled = checking
    go.textContent = checking ? 'Joining…' : locked ? 'Join' : 'Join with sound'
    if (asking && !backdrop.hidden && document.activeElement !== input && !input.value) input.focus({ preventScroll: true })
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    // This click is the go-ahead for sound (media.ts listens for it).
    joined = true
    if (!locked) return render()
    if (!input.value.trim()) {
      wrong = false
      input.focus()
      return render()
    }
    checking = true
    render()
    const key = await keyFor(input.value)
    storeKey(key)
    onKey(key)
  })

  render()
  return {
    // The relay refused this tab's key, or it had none.
    locked(isWrong: boolean) {
      if (isWrong) storeKey('')
      locked = true
      wrong = isWrong
      checking = false
      render()
    },
    // The relay let this tab in.
    unlocked() {
      if (!locked) return
      locked = false
      checking = false
      wrong = false
      joined = true
      render()
    },
    sound(needed: boolean) {
      if (sound === needed) return
      sound = needed
      if (needed || backdrop.hidden) return render()
      // The touch that turned sound on starts a click. The card goes once the
      // click is over, so the click does not land on the slide under it.
      addEventListener('click', () => render(), { once: true, capture: true })
      setTimeout(render, 800)
    },
    live(on: boolean) {
      live = on
      render()
    },
  }
}
