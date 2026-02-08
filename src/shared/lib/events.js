const listeners = new Map();

export const onEvent = (eventName, handler) => {
  if (!listeners.has(eventName)) {
    listeners.set(eventName, new Set());
  }
  listeners.get(eventName).add(handler);
  return () => listeners.get(eventName)?.delete(handler);
};

export const emitEvent = (eventName, detail) => {
  listeners.get(eventName)?.forEach((handler) => handler(detail));
};
