import { connectMessagesSocket } from "./messagesApi.js";
import { emitMessageToast } from "./toast.js";

const SOCKET_IO_SRC = "https://cdn.socket.io/4.7.5/socket.io.min.js";

const listenerMap = {
  received: new Set(),
  updated: new Set(),
  deleted: new Set(),
};

let socketPromise;
let scriptPromise;

function loadSocketIo() {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("messagesSocket requires a browser environment")
    );
  }

  if (window.io) {
    return Promise.resolve(window.io);
  }

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SOCKET_IO_SRC;
      script.async = true;
      script.onload = () => resolve(window.io);
      script.onerror = () =>
        reject(new Error("Failed to load socket.io client script"));
      document.head.appendChild(script);
    });
  }

  return scriptPromise;
}

function ensureSocket() {
  if (socketPromise) {
    return socketPromise;
  }

  socketPromise = loadSocketIo()
    .then(() =>
      connectMessagesSocket({
        onReceived: (payload) => {
          emitMessageToast(payload);
          emit("received", payload);
        },
        onUpdated: (payload) => emit("updated", payload),
        onDeleted: (payload) => emit("deleted", payload),
      })
    )
    .catch((err) => {
      socketPromise = undefined;
      console.error("[messagesSocket] 초기화 실패:", err);
      throw err;
    });

  return socketPromise;
}

function emit(channel, payload) {
  listenerMap[channel].forEach((handler) => {
    try {
      handler(payload);
    } catch (err) {
      console.error("[messagesSocket] handler error:", err);
    }
  });
}

export function subscribeToMessages({
  onReceived,
  onUpdated,
  onDeleted,
} = {}) {
  const disposers = [];

  if (typeof onReceived === "function") {
    listenerMap.received.add(onReceived);
    disposers.push(() => listenerMap.received.delete(onReceived));
  }
  if (typeof onUpdated === "function") {
    listenerMap.updated.add(onUpdated);
    disposers.push(() => listenerMap.updated.delete(onUpdated));
  }
  if (typeof onDeleted === "function") {
    listenerMap.deleted.add(onDeleted);
    disposers.push(() => listenerMap.deleted.delete(onDeleted));
  }

  ensureSocket();

  return () => {
    disposers.forEach((dispose) => dispose());
  };
}

export function attachSocketLogger(pageName) {
  const prefix = pageName ? `[${pageName}]` : "[socket]";
  return subscribeToMessages({
    onReceived: (payload) =>
      console.debug(`${prefix} message.received`, payload),
    onUpdated: (payload) =>
      console.debug(`${prefix} message.updated`, payload),
    onDeleted: (payload) =>
      console.debug(`${prefix} message.deleted`, payload),
  });
}

export function waitForMessagesSocket() {
  return ensureSocket();
}
