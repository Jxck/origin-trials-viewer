const filters = {
  urls: ["<all_urls>"],
  types: ["main_frame", "sub_frame"]
}

// we need 'var' for global scope
var headers = {}

chrome.webRequest.onHeadersReceived.addListener(function (details) {
  const { tabId, frameId } = details
  headers[tabId] = headers[tabId] || {}
  headers[tabId][frameId] = headers[tabId][frameId] || {}
  headers[tabId][frameId].response = details
}, filters, ["responseHeaders"])

// delete persisted headers when a tab is removed
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  console.log(removeInfo)
  delete headers[tabId]
})

// on navigation, check which frames still exist and delete persisted headers
// for frames which do not exist anymore
chrome.webNavigation.onCompleted.addListener((details) => {
  const { tabId } = details
  chrome.webNavigation.getAllFrames({ tabId }, (framesInfo) => {
    const frameIds = framesInfo.map(({ frameId }) => frameId)
    const headersForTab = headers[tabId]
    if (headersForTab) {
      const asArray = Object.entries(headersForTab)
      const filteredArray = asArray.filter(([frameId, response]) => frameIds.includes(Number(frameId)))
      headers[tabId] = Object.fromEntries(filteredArray)
    }
  })
}, filters)
