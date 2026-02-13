const listeners = {}

function on(event, handler) {
  if (!listeners[event]) {
    listeners[event] = []
  }
  listeners[event].push(handler)
}

function off(event, handler) {
  if (!listeners[event]) return
  listeners[event] = listeners[event].filter((fn) => fn !== handler)
}

function emit(event, payload) {
  if (!listeners[event]) return
  listeners[event].forEach((handler) => handler(payload))
}

module.exports = {
  on,
  off,
  emit
}
