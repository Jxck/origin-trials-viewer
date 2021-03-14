chrome.tabs.getSelected(null, (tab) => {
  const $  = document.querySelector.bind(document)
  const $$ = document.querySelectorAll.bind(document)

  chrome.tabs.sendRequest(tab.id, {msg: "getTokens"}, (tokens) => {
    if (tokens.length > 0) {
      $('#no-token').remove()
    }
    tokens.forEach((token) => {
      const payload = token.payload

      const $clone = $('template').content.cloneNode(true)

      $clone.querySelector('.feature').textContent = payload.feature

      $clone.querySelector('.origin + dd > a').href        = payload.origin
      $clone.querySelector('.origin + dd > a').textContent = payload.origin

      const expiry = new Date(payload.expiry * 1000)

      $clone.querySelector('.expiry + dd > time').datetime    = expiry.toLocaleString()
      $clone.querySelector('.expiry + dd > time').textContent = expiry.toLocaleString()

      if (expiry < new Date()) {
        $clone.querySelector('.expiry + dd').classList.add('expired')
      }

      $clone.querySelector('.subdomain  + dd').textContent = !!payload.isSubdomain
      $clone.querySelector('.thirdparty + dd').textContent = !!payload.isThirdParty

      $('#tokens').appendChild($clone)
    })
  })
})
