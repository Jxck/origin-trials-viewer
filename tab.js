(function() {
  const metas  = document.querySelectorAll('meta[http-equiv="origin-trial"]')
  const tokens = Array.from(metas).map((meta) => meta.content)
  return tokens
})()
