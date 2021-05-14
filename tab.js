(function () {
  const metas = document.querySelectorAll('meta[http-equiv=origin-trial]')
  const tokens = Array.from(metas).map((meta) => ({
    type: 'Meta Tag',
    value: meta.content,
  }))
  return tokens
})()