// Covers the deck until the talk is live. Once it is, short outages only show
// a small notice, so the audience keeps the current slide.
const CONNECTING = 'Connecting to the live talk…'
const OFFLINE = 'This talk isn\'t live right now. This page follows the slides when it starts.'

export function createStatus() {
  const cover = document.createElement('div')
  cover.className = 'slidev-live-cover'
  const pill = document.createElement('div')
  pill.className = 'slidev-live-pill'
  document.body.append(cover, pill)

  let live = false
  let connected = false
  let presenter = true

  function render() {
    cover.hidden = live
    cover.textContent = connected ? OFFLINE : CONNECTING
    const notice = !connected ? 'Reconnecting…' : !presenter ? 'Presenter reconnecting…' : ''
    pill.hidden = !live || !notice
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
    presenter(on: boolean) {
      presenter = on
      render()
    },
  }
}
