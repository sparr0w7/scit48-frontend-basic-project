// Toast helper module for message events.
// This only provides the event bus – actual UI rendering should be implemented later.

const listeners = new Set();

/**
 * Registers a handler that will be invoked when a toast needs to be shown.
 * @param {(toastEvent: object) => void} handler
 * @returns {() => void} unsubscribe function
 */
export function onToast(handler) {
  if (typeof handler !== "function") {
    throw new TypeError("Toast handler must be a function");
  }

  listeners.add(handler);
  return () => listeners.delete(handler);
}

/**
 * Emits a toast event to all registered handlers.
 * @param {object} event
 */
export function emitToast(event) {
  listeners.forEach((handler) => {
    try {
      handler(event);
    } catch (err) {
      console.error("[toast] handler error:", err);
    }
  });
}

/**
 * Convenience helper for message-received toasts.
 * @param {object} message
 */
export function emitMessageToast(message) {
  emitToast({
    type: "message-received",
    payload: message,
  });
}
