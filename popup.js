chrome.tabs.getSelected(null, (tab) => {
  const $  = document.querySelector.bind(document)
  const $$ = document.querySelectorAll.bind(document)

  chrome.tabs.sendRequest(tab.id, {msg: "getTokens"}, (tokens) => {
    tokens.forEach((token) => {
      const payload = token.payload

      $('.feature').textContent = payload.feature

      $('.origin + dd > a').href        = payload.origin
      $('.origin + dd > a').textContent = payload.origin

      const expiry = new Date(payload.expiry * 1000)

      $('.expiry + dd > time').datetime    = expiry.toLocaleString()
      $('.expiry + dd > time').textContent = expiry.toLocaleString()

      if (expiry < new Date()) {
        $('.expiry + dd').classList.add('expired')
      }

      $('.subdomain  + dd').textContent = !!payload.isSubdomain
      $('.thirdparty + dd').textContent = !!payload.isThirdParty
    })
  })
})
