/**
 * Messages API helper for plain HTML/CSS/JS projects.
 * Every function mirrors the Nest backend contract under src/api/messages.
 * Update BASE_URL if your backend runs on a different origin.
 */
const BASE_URL = "http://localhost:8000/api";
const WS_BASE_URL = "http://localhost:8000";
const WS_NAMESPACE = "/messages";

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const defaultHeaders = {
    Accept: "application/json",
    ...options.headers,
  };

  const response = await fetch(url, {
    method: options.method || "GET",
    headers: defaultHeaders,
    body: options.body,
    credentials: "include", // keep session cookies for admin features if needed
  });

  const payload = await safeJson(response);
  if (!response.ok) {
    throw new Error(payload?.message || `Request failed: ${response.status}`);
  }

  return payload;
}

function safeJson(response) {
  return response.text().then((text) => {
    if (!text) {
      return null;
    }
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  });
}

/**
 * POST /messages
 * Req: { toIP: string, subject?: string, body: string }
 * Res: MessageDto (id, fromIP, toIP, subject, body, status, timestamps)
 */
export function sendMessage({ toIP, subject, body }) {
  return request("/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ toIP, subject, body }),
  });
}

/**
 * GET /messages/my-ip
 * Res: { ip: string }
 */
export function getMyPublicIp() {
  return request("/messages/my-ip");
}

/**
 * GET /messages/inbox
 * Req query: { cursor?: string, limit?: number } (receiver IP auto-detected)
 * Res: { data: MessageDto[], nextCursor: string | null }
 */
export function getInboxMessages({ cursor, limit } = {}) {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (limit) params.set("limit", limit);

  const suffix = params.toString() ? `?${params.toString()}` : "";
  return request(`/messages/inbox${suffix}`);
}

/**
 * GET /messages/sent
 * Req query: { cursor?: string, limit?: number } (sender IP auto-detected)
 * Res: { data: MessageDto[], nextCursor: string | null }
 */
export function getSentMessages({ cursor, limit } = {}) {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (limit) params.set("limit", limit);

  const suffix = params.toString() ? `?${params.toString()}` : "";
  return request(`/messages/sent${suffix}`);
}

/**
 * GET /messages/:id
 * Req param: message id
 * Res: MessageDto
 */
export function getMessage(id) {
  return request(`/messages/${encodeURIComponent(id)}`);
}

/**
 * POST /messages/:id/cancel
 * Req param: message id (sender IP auto-detected, no body)
 * Res: MessageDto with status === 'canceled'
 */
export function cancelMessage(id) {
  return request(`/messages/${encodeURIComponent(id)}/cancel`, {
    method: "POST",
  });
}

/**
 * DELETE /messages/:id
 * Req param: message id (sender IP auto-detected, no body)
 * Res: { message: string }
 */
export function deleteMessage(id) {
  return request(`/messages/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

/**
 * GET /messages/status/:status
 * Req params: status ('sent' | 'canceled' | 'failed'), query { cursor?, limit? }
 * Res: { data: MessageDto[], nextCursor: string | null }
 */
export function getMessagesByStatus(status, { cursor, limit } = {}) {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (limit) params.set("limit", limit);

  const suffix = params.toString() ? `?${params.toString()}` : "";
  return request(`/messages/status/${encodeURIComponent(status)}${suffix}`);
}

/**
 * Connects to the WebSocket namespace to receive live events.
 * Requires socket.io client script in the browser (cdn: https://cdn.socket.io/4.7.5/socket.io.min.js)
 *
 * Events emitted:
 *  - message.received => payload: MessageDto
 *  - message.updated  => payload: MessageDto (status change)
 *  - message.deleted  => payload: { id, fromIP, toIP }
 *
 * @param {Object} options optional config
 * @param {string} options.baseUrl backend origin, default http://localhost:8000
 * @param {string} options.overrideIp optional custom IP to bind this socket to (rare)
 * @param {function} options.onReceived handler for new messages
 * @param {function} options.onUpdated handler for status updates
 * @param {function} options.onDeleted handler for deletions
 * @returns {Socket} socket.io client instance
 */
export function connectMessagesSocket({
  baseUrl = WS_BASE_URL,
  overrideIp,
  onReceived,
  onUpdated,
  onDeleted,
} = {}) {
  if (typeof io === "undefined") {
    throw new Error("socket.io client is required (window.io not found)");
  }

  const socket = io(`${baseUrl}${WS_NAMESPACE}`, {
    withCredentials: true,
    query: overrideIp ? { ip: overrideIp } : undefined,
    transports: ["websocket"],
  });

  if (typeof onReceived === "function") {
    socket.on("message.received", onReceived);
  }
  if (typeof onUpdated === "function") {
    socket.on("message.updated", onUpdated);
  }
  if (typeof onDeleted === "function") {
    socket.on("message.deleted", onDeleted);
  }

  return socket;
}
