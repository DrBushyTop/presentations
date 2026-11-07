// The join card in the middle of the screen, shared by the unlock page of a
// sealed site (unlock.js) and the viewer app (client/join.ts). Styles are in
// join.css.
const SPEAKER = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19.5 5.5a9 9 0 0 1 0 13"/></svg>'

export function buildCard() {
  const [title, byline] = document.title.split(' · ')
  const backdrop = document.createElement('div')
  backdrop.className = 'slidev-live-join'
  backdrop.innerHTML = `
    <form class="slidev-live-join-card" novalidate>
      <h1></h1>
      <p class="slidev-live-join-by"></p>
      <label class="slidev-live-join-field">
        <span>Password</span>
        <input type="password" name="password" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="go">
      </label>
      <p class="slidev-live-join-error" role="alert"></p>
      <button type="submit" class="slidev-live-join-go"></button>
      <p class="slidev-live-join-hint">${SPEAKER}<span>Sound is on. Mute it any time with the speaker button in the bottom-right corner.</span></p>
    </form>`
  const q = selector => backdrop.querySelector(selector)
  const card = {
    backdrop,
    form: q('form'),
    field: q('.slidev-live-join-field'),
    input: q('input'),
    error: q('.slidev-live-join-error'),
    go: q('button'),
    hint: q('.slidev-live-join-hint'),
  }
  q('h1').textContent = title || 'Live talk'
  const by = q('.slidev-live-join-by')
  by.textContent = byline ?? ''
  by.hidden = !byline
  document.body.append(backdrop)
  return card
}

// `?password=` in the link fills the field in. It leaves the address bar, so
// it is not copied on by accident.
export function takeLinkPassword() {
  const params = new URLSearchParams(location.search)
  const given = params.get('password') ?? ''
  if (params.has('password')) {
    params.delete('password')
    const query = params.toString()
    history.replaceState(history.state, '', `${location.pathname}${query ? `?${query}` : ''}${location.hash}`)
  }
  return given
}
