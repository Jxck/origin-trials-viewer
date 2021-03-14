if (window == top) {
  chrome.extension.sendRequest({msg : "showAction"})

  chrome.extension.onRequest.addListener((req, sender, sendResponse) => {
    switch (req.msg) {
      case "getTokens":
        const metas  = document.querySelectorAll('meta[http-equiv="origin-trial"]')
        const tokens = Array.from(metas).map((meta) => decodeToken(meta.content))
        sendResponse(tokens)
        break
      default:
        break
    }
  })
}
