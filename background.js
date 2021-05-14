const filters = {
  urls: ["<all_urls>"],
  types: ["main_frame", "sub_frame"]
}

// tabId => frameId => response
globalThis.headers = new Map()

chrome.webRequest.onHeadersReceived.addListener((response) => {
  const { tabId, frameId } = response
  if (headers.has(tabId) === false) headers.set(tabId, new Map())
  headers.get(tabId).set(frameId, response)
}, filters, ["responseHeaders"])

// delete persisted headers when a tab is removed
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  headers.delete(tabId)
})

// on navigation, check which frames still exist and delete persisted headers
// for frames which do not exist anymore
chrome.webNavigation.onCompleted.addListener((response) => {
  const { tabId } = response
  chrome.webNavigation.getAllFrames({ tabId }, (framesInfo) => {
    if (headers.has(tabId)) {
      const frameIds = framesInfo.map(({ frameId }) => frameId)
      const frameHeaders = headers.get(tabId)
      frameHeaders.forEach((value, key) => {
        if (frameIds.includes(key) === false) {
          frameHeaders.delete(key)
        }
      })
    }
  })
}, filters)