// Covers the deck until the talk is live. Once it is, short outages only show
// a small notice, so the audience keeps the current slide.
const CONNECTING = 'Connecting to the live talk…'
const OFFLINE = 'This talk isn\'t live right now. This page follows the slides when it starts.'
const SWITCHING = {
  deck: 'The next talk is starting. This page updates as soon as it\'s ready.',
  build: 'Updating the slides. This page reloads in a moment.',
}

export function createStatus() {
  const cover = document.createElement('div')
  cover.className = 'slidev-live-cover'
  const pill = document.createElement('div')
  pill.className = 'slidev-live-pill'
  document.body.append(cover, pill)

  let live = false
  let connected = false
  let presenter = true
  let switching: keyof typeof SWITCHING | false = false

  function render() {
    cover.hidden = live && !switching
    cover.textContent = switching ? SWITCHING[switching] : connected ? OFFLINE : CONNECTING
    const notice = !connected ? 'Reconnecting…' : !presenter ? 'Presenter reconnecting…' : ''
    pill.hidden = !live || switching || !notice
    pill.textContent = notice
  }

  render()

  return {
    connecting() {
      connected = false
      render()
    },
    live(on: boolean) {
      connected = true
      live = on
      render()
    },
    switching(kind: keyof typeof SWITCHING | false) {
      connected = true
      switching = kind
      render()
    },
    presenter(on: boolean) {
      presenter = on
      render()
    },
  }
}
