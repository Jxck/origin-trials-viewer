
import {decodeToken, extractOT} from "./util.js"

function displayToken(token) {
  const $ = document.querySelector.bind(document)
  const $$ = document.querySelectorAll.bind(document)

  try {
    const decoded_token = decodeToken(token.value)
    const payload = decoded_token.payload

    const $token = $('template#token').content.cloneNode(true)

    $token.querySelector('.feature').textContent = payload.feature

    $token.querySelector('.origin + dd > a').href = payload.origin
    $token.querySelector('.origin + dd > a').textContent = payload.origin
    $token.querySelector('.type  + dd').textContent = token.type

    const expiry = new Date(payload.expiry * 1000)

    $token.querySelector('.expiry + dd > time').datetime = expiry.toLocaleString()
    $token.querySelector('.expiry + dd > time').textContent = expiry.toLocaleString()

    if (expiry < new Date()) {
      $token.querySelector('.expiry + dd').classList.add('expired')
    }

    $token.querySelector('.subdomain  + dd').textContent = !!payload.isSubdomain
    $token.querySelector('.thirdparty + dd').textContent = !!payload.isThirdParty

    $('#tokens').appendChild($token)
  } catch (error) {
    console.log('error', error)
    const $error = $('template#error').content.cloneNode(true)
    $error.querySelector('.feature').textContent = 'Invalid token'
    $error.querySelector('.type  + dd').textContent = token.type
    $error.querySelector('.raw-token + dd').textContent = token.value
    $('#tokens').appendChild($error)
  } finally {
    $('#no-token')?.remove()
  }
}

chrome.tabs.executeScript({ file: 'tab.js' }, ([tokens]) => {
  tokens.forEach(displayToken)
})

chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
  const tabId = tabs[0].id
  const tabHeaders = chrome.extension.getBackgroundPage().headers[tabId]
  chrome.webNavigation.getAllFrames({ tabId }, function (framesInfo) {
    framesInfo.flatMap(({ frameId }) => {
      const frameHeaders = tabHeaders[frameId]
      return extractOT(frameHeaders?.response?.responseHeaders)
    }).forEach((token) => {
      displayToken(token)
    })
  })
})