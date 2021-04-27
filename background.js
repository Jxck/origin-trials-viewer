var filters = {
  urls: ["<all_urls>"],
  types: ["main_frame", "sub_frame"]
};

var headers = {};

chrome.webRequest.onHeadersReceived.addListener(function(details) {
  headers[details.tabId] = headers[details.tabId] || {};
  headers[details.tabId][details.frameId] = headers[details.tabId][details.frameId] || {};
  headers[details.tabId][details.frameId].response = details;
}, filters, ["responseHeaders"]);

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
	delete headers[tabId];
});

chrome.webNavigation.onCompleted.addListener(function(details) {
  chrome.webNavigation.getAllFrames({tabId: details.tabId}, function(framesInfo) {
    const currentFrames = framesInfo.map(frameInfo => frameInfo.frameId);
    const headersForTab = headers[details.tabId];
    if (headersForTab) {
      const asArray = Object.entries(headersForTab);
      const filteredArray = asArray.filter(([frameId, response]) => currentFrames.includes(Number(frameId)));
      headers[details.tabId] = Object.fromEntries(filteredArray);
    }
  });
}, filters);
