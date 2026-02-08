import { qs } from "../lib/dom.js";

let timeoutId;

export const showToast = (message, duration = 2200) => {
  const toast = qs("[data-toast]");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    toast.classList.remove("is-visible");
  }, duration);
};
